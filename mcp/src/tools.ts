import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  ComparisonSchema,
  FaqPageSchema,
  LeadCreatedSchema,
  ProductPageSchema,
  ProductSchemaOutput,
  RecommendationSchema,
  SalePilotApiClient,
  SalePilotApiError,
} from "./api-client.js";

const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");
type ResponseFormat = z.infer<typeof ResponseFormatSchema>;

function productField(product: object, key: string): string {
  const value = Reflect.get(product, key);
  return typeof value === "string" || typeof value === "number" ? String(value) : "-";
}

function formatProducts(page: z.infer<typeof ProductPageSchema>): string {
  if (page.items.length === 0) {
    return "Không tìm thấy sản phẩm phù hợp trong catalog demo.";
  }
  const products = page.items.map((product) => {
    return `- **${productField(product, "sku")}**: ${productField(product, "name")} | ${productField(product, "price_display")} | ${productField(product, "room_m2_min")}–${productField(product, "room_m2_max")}m²`;
  });
  return [`## Sản phẩm (${page.total_count})`, ...products].join("\n");
}

function recordList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    : [];
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function formatProduct(product: Record<string, unknown>): string {
  const details = [
    `- SKU: **${productField(product, "sku")}**`,
    `- Tên: ${productField(product, "name")}`,
    `- Giá: ${productField(product, "price_display")}`,
    `- Công suất: ${productField(product, "btu")} BTU | ${productField(product, "hp")} HP`,
    `- Phòng phù hợp: ${productField(product, "room_m2_min")}–${productField(product, "room_m2_max")}m²`,
    `- Inverter: ${String(product.inverter === true)}`,
    `- Độ ồn: ${productField(product, "noise_db")} dB`,
  ];
  return [`## ${productField(product, "name")}`, ...details].join("\n");
}

function formatComparison(comparison: Record<string, unknown>): string {
  const items = recordList(comparison.items).map((product) => {
    return `- ${productField(product, "sku")}: ${productField(product, "name")} (${productField(product, "price_display")})`;
  });
  const tradeoffs = stringList(comparison.tradeoffs).map((tradeoff) => `- ${tradeoff}`);
  return ["## So sánh máy lạnh", ...items, "", "### Trade-off", ...tradeoffs].join("\n");
}

function formatRecommendation(recommendation: Record<string, unknown>): string {
  if (recommendation.need_more === true) {
    const questions = stringList(recommendation.ask).map((question) => `- ${question}`);
    return ["## Cần thêm thông tin", ...questions].join("\n");
  }
  const products = recordList(recommendation.top3).map((product, index) => {
    return `${index + 1}. **${productField(product, "sku")}** - ${productField(product, "name")} (${productField(product, "price_display")})\n   ${productField(product, "why")}`;
  });
  const tradeoffs = stringList(recommendation.tradeoffs).map((tradeoff) => `- ${tradeoff}`);
  return ["## Top 3 đề xuất", ...products, "", "### Trade-off", ...tradeoffs].join("\n");
}

function formatFaq(page: z.infer<typeof FaqPageSchema>): string {
  if (page.items.length === 0) {
    return "Không tìm thấy chính sách phù hợp trong knowledge base.";
  }
  const entries = page.items.map((faq) => {
    return `### ${productField(faq, "question")}\n${productField(faq, "answer")}`;
  });
  return [`## Chính sách và FAQ (${page.total_count})`, ...entries].join("\n\n");
}

function toolResult<T extends Record<string, unknown>>(
  data: T,
  responseFormat: ResponseFormat,
  markdown: string,
) {
  return {
    content: [
      {
        type: "text" as const,
        text: responseFormat === "json" ? JSON.stringify(data, null, 2) : markdown,
      },
    ],
    structuredContent: data,
  };
}

function toolError(error: unknown) {
  const message =
    error instanceof SalePilotApiError
      ? error.message
      : "SalePilot MCP could not complete the request. Check the server configuration and retry.";
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

export function registerSalePilotTools(server: McpServer, api: SalePilotApiClient): void {
  server.registerTool(
    "salepilot_search_products",
    {
      title: "Search SalePilot Air Conditioners",
      description:
        "Search the SalePilot air-conditioner catalog by keyword, budget, room size, inverter preference, or brand. Returns paginated catalog facts only; use salepilot_recommend_products for a ranked top-3 recommendation.",
      inputSchema: z.object({
        query: z.string().max(200).optional().describe("Keyword such as 'inverter quiet'"),
        budget_vnd: z.number().int().nonnegative().max(1_000_000_000).optional(),
        room_m2: z.number().positive().max(500).optional(),
        inverter: z.boolean().optional(),
        brand: z.string().max(80).optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().nonnegative().default(0),
        response_format: ResponseFormatSchema,
      }),
      outputSchema: ProductPageSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ response_format, ...params }) => {
      try {
        const page = await api.searchProducts(params);
        return toolResult(page, response_format, formatProducts(page));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "salepilot_get_product",
    {
      title: "Get a SalePilot Air Conditioner",
      description:
        "Get catalog-backed details for one air-conditioner SKU, including price, stock, room-size range, inverter status, noise, promotions, pros, and trade-offs.",
      inputSchema: z.object({
        sku: z.string().trim().min(3).max(32).describe("Catalog SKU, for example AC-002"),
        response_format: ResponseFormatSchema,
      }),
      outputSchema: ProductSchemaOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ sku, response_format }) => {
      try {
        const product = await api.getProduct(sku);
        return toolResult(product, response_format, formatProduct(product));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "salepilot_compare_products",
    {
      title: "Compare SalePilot Air Conditioners",
      description:
        "Compare two to five SalePilot air-conditioner SKUs using catalog facts. Returns item details plus price, noise, capacity, and inverter trade-offs.",
      inputSchema: z.object({
        skus: z
          .array(z.string().trim().min(3).max(32))
          .min(2)
          .max(5)
          .refine((skus) => new Set(skus.map((sku) => sku.toUpperCase())).size === skus.length, {
            message: "SKUs must be unique.",
          }),
        response_format: ResponseFormatSchema,
      }),
      outputSchema: ComparisonSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ skus, response_format }) => {
      try {
        const comparison = await api.compareProducts(skus);
        return toolResult(comparison, response_format, formatComparison(comparison));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "salepilot_recommend_products",
    {
      title: "Recommend SalePilot Air Conditioners",
      description:
        "Rank the catalog and return a diversified top-3 air-conditioner recommendation. Supply room_m2 and budget_vnd for a complete answer; otherwise the tool returns specific clarification questions unless force is true.",
      inputSchema: z.object({
        room_m2: z.number().positive().max(500).optional(),
        budget_vnd: z.number().int().nonnegative().max(1_000_000_000).optional(),
        priorities: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
        force: z.boolean().default(false),
        free_text: z.string().max(500).default(""),
        response_format: ResponseFormatSchema,
      }),
      outputSchema: RecommendationSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ response_format, ...params }) => {
      try {
        const recommendation = await api.recommendProducts(params);
        return toolResult(recommendation, response_format, formatRecommendation(recommendation));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "salepilot_search_faq",
    {
      title: "Search SalePilot Policy FAQ",
      description:
        "Search SalePilot's catalog-backed air-conditioner policies for installation, delivery, warranty, installments, returns, and maintenance. Returns paginated source FAQ entries.",
      inputSchema: z.object({
        query: z.string().max(200).default(""),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().nonnegative().default(0),
        response_format: ResponseFormatSchema,
      }),
      outputSchema: FaqPageSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ response_format, ...params }) => {
      try {
        const page = await api.searchFaq(params);
        return toolResult(page, response_format, formatFaq(page));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "salepilot_create_lead",
    {
      title: "Create a Confirmed SalePilot Lead",
      description:
        "Create a CRM lead only after the customer explicitly agrees to share their contact information. Requires confirmed=true and a configured MCP write token; never call this tool to infer or fabricate consent.",
      inputSchema: z.object({
        confirmed: z.boolean().describe("True only after explicit customer confirmation."),
        name: z.string().trim().min(1).max(128).optional(),
        phone: z.string().trim().regex(/^[0-9+(). -]{8,32}$/),
        interest: z.string().trim().min(1).max(1_000),
        budget_vnd: z.number().int().nonnegative().max(1_000_000_000).optional(),
        notes: z.string().max(2_000).optional(),
        score: z.number().min(0).max(1).default(0.5),
        response_format: ResponseFormatSchema,
      }),
      outputSchema: LeadCreatedSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ confirmed, response_format, ...params }) => {
      if (!confirmed) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Lead was not created. Ask the customer for explicit consent, then call again with confirmed=true.",
            },
          ],
          isError: true,
        };
      }
      try {
        const lead = await api.createLead({ ...params, confirmed: true });
        return toolResult(lead, response_format, `## Lead created\n${lead.message}`);
      } catch (error) {
        return toolError(error);
      }
    },
  );
}
