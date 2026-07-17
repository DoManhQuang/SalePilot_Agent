import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverPath = fileURLToPath(new URL("./index.js", import.meta.url));
const childEnv: Record<string, string> = {};

for (const [key, value] of Object.entries(process.env)) {
  if (value !== undefined) {
    childEnv[key] = value;
  }
}

async function callSuccessfulTool(
  client: Client,
  name: string,
  args: Record<string, unknown>,
): Promise<void> {
  const result = await client.callTool({ name, arguments: args });
  assert.notEqual(result.isError, true, `${name} returned an error`);
  assert(Array.isArray(result.content) && result.content.length > 0, `${name} returned no content`);
}

async function main(): Promise<void> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    env: childEnv,
  });
  const client = new Client(
    { name: "salepilot-mcp-smoke", version: "0.1.0" },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    const names = new Set(tools.map((tool) => tool.name));
    for (const name of [
      "salepilot_search_products",
      "salepilot_get_product",
      "salepilot_compare_products",
      "salepilot_recommend_products",
      "salepilot_search_faq",
      "salepilot_create_lead",
    ]) {
      assert(names.has(name), `Missing MCP tool: ${name}`);
    }

    await callSuccessfulTool(client, "salepilot_search_products", {
      query: "inverter",
      limit: 2,
      response_format: "json",
    });
    await callSuccessfulTool(client, "salepilot_get_product", {
      sku: "AC-002",
      response_format: "json",
    });
    await callSuccessfulTool(client, "salepilot_compare_products", {
      skus: ["AC-002", "AC-010"],
      response_format: "json",
    });
    await callSuccessfulTool(client, "salepilot_recommend_products", {
      room_m2: 12,
      budget_vnd: 10_000_000,
      priorities: ["em", "tiet_kiem_dien"],
      response_format: "json",
    });
    await callSuccessfulTool(client, "salepilot_search_faq", {
      query: "lắp đặt",
      limit: 2,
      response_format: "json",
    });

    if (process.env.SALEPILOT_MCP_WRITE_TOKEN) {
      await callSuccessfulTool(client, "salepilot_create_lead", {
        confirmed: true,
        name: "MCP Smoke",
        phone: "0909999888",
        interest: "Máy lạnh inverter 1 HP",
        budget_vnd: 10_000_000,
        response_format: "json",
      });
    } else {
      const result = await client.callTool({
        name: "salepilot_create_lead",
        arguments: {
          confirmed: false,
          phone: "0909999888",
          interest: "Máy lạnh inverter 1 HP",
          response_format: "json",
        },
      });
      assert.equal(result.isError, true);
    }
    console.log(`MCP smoke passed: ${tools.length} tool(s) available.`);
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown MCP smoke test error.";
  console.error(`MCP smoke failed: ${message}`);
  process.exitCode = 1;
});
