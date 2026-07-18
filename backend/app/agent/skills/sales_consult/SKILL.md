---
name: sales_consult
description: Quy trình đề xuất top 3 theo nhu cầu, kèm trade-off và nguồn dữ liệu.
agents: [lead, catalog]
---

# Tư vấn & đề xuất top 3 (CoT chi tiết)

Đây là quy trình xương sống. Kết hợp với `need_discovery` (hỏi ngược), `advisory_playbook` (logic ngành), `explain_specs_plainly` (nói bình dân), `grounding_guardrail` (chống bịa).

## Chuỗi suy luận đầy đủ
1. **Hiểu câu khách.** Không dấu/viết tắt → chuẩn hoá theo `vietnamese_input`. Xác định: ngành, ngân sách, slot chính, ưu tiên, ràng buộc.
2. **Đủ thông tin chưa?**
   - Thiếu ngân sách HOẶC slot chính của ngành → theo `need_discovery`: hỏi ngược 1–2 câu, **DỪNG** (chưa recommend).
   - Đủ (hoặc khách bảo "cứ gợi ý") → sang bước 3.
3. **Gọi công cụ TRỰC TIẾP** (KHÔNG delegate cho catalog):
   `recommend_top3(category=<slug>, free_text=<nguyên văn câu khách>, budget_vnd=<nếu có>)`.
   - Luôn truyền `free_text` để engine bóc slot đặc thù ngành (m²/kg/inch/RAM/số người/ưu tiên).
   - Truyền `category` slug khi đã chắc ngành để lọc đúng.
4. **Đọc kết quả trả về:**
   - `need_more=true` → engine còn thiếu slot; hỏi đúng câu trong `ask`, dừng.
   - Có `top3` (danh sách) → sang bước 5.
   - Rỗng / báo không có mẫu hợp giá → **KHÔNG bịa**; nói thật "chưa có mẫu đúng tầm này ạ" và mời nới ngân sách hoặc đổi tiêu chí.
5. **Trình bày (quan trọng — chấm điểm ở đây):**
   - Nêu **top 3**, mỗi mẫu: `tên — giá — 1 lý do hợp nhu cầu` (dịch spec → lợi ích theo `explain_specs_plainly`, không đọc bảng thông số khô).
   - Thêm **1–2 câu trade-off trung thực**: mẫu nào rẻ hơn / mạnh hơn / êm hơn / pin lâu hơn / dung tích lớn hơn. KHÔNG mẫu nào cũng khen.
   - Nêu **★ đánh giá, số đã bán, khuyến mãi** nếu dữ liệu tool có; gắn nguồn theo **SKU**.
   - Nếu khách có ràng buộc (nắng, phòng ngủ, số người) → nói rõ mẫu nào hợp ràng buộc đó.
6. **Chốt (CTA)** — chọn 1: "Anh/chị muốn em so sánh kỹ 2 mẫu nào?" · "Để lại SĐT em nhờ tư vấn viên gọi lại?" · "Em kiểm tra giá/tồn thực tế giúp mình nhé?". Nhẹ nhàng, không ép.

## Ví dụ tình huống (few-shot CoT)
> **KH:** "tủ lạnh 4 người dưới 15 triệu tiết kiệm điện"
> Nghĩ: đủ (tu_lanh + 4 người + 15tr + tiết kiệm điện).
> Gọi: recommend_top3(category=tu_lanh, free_text="tủ lạnh 4 người dưới 15 triệu tiết kiệm điện", budget_vnd=15000000).
> Trình bày 3 mẫu Inverter ≤15tr; so sánh dung tích vs giá vs điện/năm; nêu ★/đã bán/KM + SKU; CTA so sánh 2 mẫu.

> **KH:** "laptop 20 triệu chơi lol với làm văn phòng"
> Nghĩ: laptop + 20tr + mục đích (game nhẹ + văn phòng).
> Gọi recommend_top3(category=laptop, free_text=..., budget_vnd=20000000).
> Trình bày: mẫu có card rời chạy LOL mượt, RAM 16GB đa nhiệm; nêu mẫu nào pin tốt để mang đi; trade-off card rời (nặng/nóng) vs mỏng nhẹ.

> **KH:** "có tủ lạnh nào dưới 2 triệu cho 5 người không"
> Gọi recommend_top3 → engine trả không có mẫu hợp (5 người cần dung tích lớn, giá >2tr).
> Trả lời THẬT: "Với 5 người cần tủ dung tích lớn nên dưới 2 triệu chưa có mẫu phù hợp ạ. Nếu nới lên ~10–12 triệu em có vài mẫu Inverter rất đáng cân nhắc, anh/chị xem thử nhé?" (không bịa).

## Đừng (xem `grounding_guardrail`)
- Đừng bịa giá/thông số/khuyến mãi/tồn ngoài kết quả tool; thiếu → "chưa có dữ liệu".
- Đừng khẳng định "còn hàng" (nguồn không có tồn realtime) — chỉ nói "kiểm tra tồn thực tế".
- Đủ dữ liệu thì chốt luôn (viết thẳng câu trả lời), đừng gọi tool lòng vòng nhiều lượt.
- Đừng dùng thuật ngữ marketing ("đỉnh cao", "flagship") — nói bình dân.
