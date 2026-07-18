import Link from "next/link";

const FEATURES = [
  {
    icon: "🎯",
    title: "Tư vấn theo nhu cầu thật",
    desc: "Hiểu số người dùng, ngân sách, dung tích, kiểu dáng & chỗ đặt — hỏi ngược khi thiếu thông tin.",
  },
  {
    icon: "⚖️",
    title: "So sánh Top 3 kèm trade-off",
    desc: "Đề xuất 3 lựa chọn phù hợp nhất, nêu rõ ưu/nhược để khách quyết định nhanh.",
  },
  {
    icon: "🧠",
    title: "Ghi nhớ khách hàng",
    desc: "Lưu hồ sơ, sở thích và lịch sử để mỗi lượt tư vấn cá nhân hoá hơn.",
  },
  {
    icon: "🔒",
    title: "Không bịa giá / tồn kho",
    desc: "Mọi số liệu lấy từ catalog nội bộ qua tool — chống ảo giác thông tin.",
  },
];

export default function HomePage() {
  return (
    <main className="stack">
      <section className="hero">
        <div className="card">
          <span className="hero-eyebrow">✨ VAIC 2026 · Năng suất SME · Điện máy & công nghệ</span>
          <h1 className="hero-title">
            Trợ lý bán hàng <span className="grad">đa tác nhân</span> cho ngành điện máy
          </h1>
          <p className="hero-lead">
            SalePilot tư vấn &amp; so sánh tủ lạnh, máy lạnh, máy giặt, đồng hồ thông minh, máy
            tính bảng… theo đúng nhu cầu của khách. Nhiều tác nhân phối hợp:{" "}
            <strong>Lead · Catalog · Knowledge · CRM</strong>.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/chat">
              Bắt đầu tư vấn →
            </Link>
            <Link className="btn ghost" href="/dashboard">
              Xem Dashboard
            </Link>
          </div>
          <div className="hero-try">
            <b>Thử ngay</b>
            “Gia đình 4 người, dưới 15 triệu, cần tủ lạnh inverter, ngang tối đa 70 cm”
          </div>
        </div>

        <div className="hero-panel">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <div className="feature-icon" aria-hidden>
                {f.icon}
              </div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stat-strip">
        <div className="card">
          <div className="v">
            <span className="grad">4+</span>
          </div>
          <div className="l">Tác nhân phối hợp (Lead, Catalog, Knowledge, CRM)</div>
        </div>
        <div className="card">
          <div className="v">
            <span className="grad">Top 3</span>
          </div>
          <div className="l">Đề xuất kèm trade-off rõ ràng cho mỗi nhu cầu</div>
        </div>
        <div className="card">
          <div className="v">
            <span className="grad">0</span>
          </div>
          <div className="l">Giá / tồn kho bịa đặt — dữ liệu từ catalog nội bộ</div>
        </div>
      </section>
    </main>
  );
}
