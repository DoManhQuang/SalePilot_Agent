import Link from "next/link";

export default function HomePage() {
  return (
    <main className="hero">
      <div className="card">
        <span className="badge">VAIC 2026 · Năng suất SME · Điện Máy Xanh</span>
        <h1>SalePilot</h1>
        <p>
          Trợ lý AI <strong>so sánh &amp; tư vấn máy lạnh theo nhu cầu thật</strong> — hiểu ngân
          sách, m² phòng, ưu tiên (tiết kiệm điện / êm / giá), hỏi ngược khi thiếu thông tin, đề
          xuất <strong>top 3</strong> kèm trade-off. Multi-agent: Lead · Catalog · Knowledge · CRM.
          Không bịa giá/tồn — mọi số liệu từ catalog.
        </p>
        <div className="cta-row">
          <Link className="btn" href="/chat">
            Bắt đầu tư vấn
          </Link>
          <Link className="btn ghost" href="/dashboard">
            Dashboard
          </Link>
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Thử: “Phòng ngủ 12m², dưới 10 triệu, muốn êm và tiết kiệm điện”
        </p>
      </div>
    </main>
  );
}
