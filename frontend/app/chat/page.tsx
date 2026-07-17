"use client";

import { useMemo, useState } from "react";
import { chatOnce, type TraceStep } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const CHIPS = [
  "Phòng ngủ 12m2, dưới 10 triệu, muốn êm và tiết kiệm điện",
  "Phòng khách 28m2, ngân sách 18 triệu, làm lạnh mạnh",
  "So sánh giúp máy inverter 1HP khoảng 9–12 triệu",
  "Bảo hành máy lạnh thế nào?",
  "Căn hộ thuê, càng rẻ càng tốt, phòng 10m2",
];

function agentClass(name: string) {
  const n = name.toLowerCase();
  if (["lead", "catalog", "knowledge", "crm", "order", "escalation"].includes(n)) return n;
  return "";
}

export default function ChatPage() {
  const externalId = useMemo(() => `web-${Math.random().toString(36).slice(2, 10)}`, []);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Chào bạn! Em là SalePilot — tư vấn máy lạnh theo nhu cầu thật (không chỉ bảng thông số). " +
        "Cho em biết phòng khoảng bao nhiêu m² và ngân sách nhé?",
    },
  ]);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [memoryHit, setMemoryHit] = useState("");
  const [runId, setRunId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(textIn?: string) {
    const text = (textIn ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setError("");
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await chatOnce(text, externalId);
      setMsgs((m) => [...m, { role: "assistant", content: res.reply }]);
      setTrace(res.trace || []);
      setAgents(res.used_agents || []);
      setMemoryHit(res.memory_summary || "");
      setRunId(res.run_id || "");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: "Lỗi gọi API. Kiểm tra backend :8000 và CORS." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid2">
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <strong>Tư vấn máy lạnh</strong>
          <span className="muted">{externalId}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {CHIPS.map((c) => (
            <button key={c} type="button" className="btn ghost" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => send(c)} disabled={loading}>
              {c.length > 42 ? c.slice(0, 40) + "…" : c}
            </button>
          ))}
        </div>
        <div className="chat-log">
          {msgs.map((m, i) => (
            <div key={i} className={`bubble ${m.role === "user" ? "user" : "bot"}`}>
              {m.content}
            </div>
          ))}
          {loading && <div className="muted">Agent đang tư vấn…</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            value={input}
            placeholder="Mô tả nhu cầu bằng tiếng Việt…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn" onClick={() => send()} disabled={loading}>
            Gửi
          </button>
        </div>
        {error && (
          <p className="muted" style={{ color: "var(--danger)", marginTop: 8 }}>
            {error}
          </p>
        )}
      </section>

      <section className="card">
        <strong>Agent Trace</strong>
        <p className="muted">Lead → catalog/knowledge · anti-hallucination via tools</p>
        {memoryHit && (
          <p className="badge" style={{ marginBottom: 8 }}>
            memory: {memoryHit.slice(0, 120)}
          </p>
        )}
        {runId && <p className="muted">run: {runId}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "10px 0" }}>
          {agents.map((a) => (
            <span key={a} className={`badge ${agentClass(a)}`}>
              {a}
            </span>
          ))}
          {!agents.length && <span className="muted">Chưa có lượt chạy</span>}
        </div>
        <div className="trace-list">
          {trace.map((t, i) => (
            <div key={i} className="trace-item">
              <div className="meta">
                <span className={`badge ${agentClass(t.agent)}`}>{t.agent}</span> · {t.event}
              </div>
              <div>{t.detail || "—"}</div>
            </div>
          ))}
          {!trace.length && <div className="muted">Trace hiện sau mỗi câu trả lời.</div>}
        </div>
      </section>
    </main>
  );
}
