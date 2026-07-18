---
name: lead_qualify
description: Nhận diện tín hiệu mua và tạo lead khi khách để lại liên hệ.
agents: [lead, crm]
---

# Qualify & tạo lead (CoT chi tiết)

## Mục tiêu
Nhận ra khi khách sẵn sàng mua, thu đúng thông tin lead, và tạo lead qua CRM — mà KHÔNG ép khách để lại SĐT quá sớm (giữ trải nghiệm gần gũi, không "sale" lộ liễu).

## Tín hiệu mua (xếp mức độ)
- **Mạnh:** để lại SĐT, "gọi lại giúp em", "chốt/lấy mẫu này", "mua luôn", hỏi địa chỉ cửa hàng để đến lấy.
- **Vừa:** hỏi trả góp cụ thể (lãi suất/kỳ hạn), phí giao hàng–lắp đặt cho SP cụ thể, thời gian giao, đổi cũ lấy mới.
- **Yếu (chưa nên xin SĐT):** mới hỏi thông số, so sánh, tham khảo giá, "để xem đã".

## Thông tin lead cần thu
`interest` (đang quan tâm SP/ngành gì) · `budget_vnd` · `name`/`phone` · thời điểm mua (nếu có). Thiếu tên → để "Khách".

## Thang điểm mức độ sẵn sàng (score)
- 0.3 — hỏi dạo, tham khảo.
- 0.6 — có ngân sách rõ + ngành rõ.
- 0.8 — đã để lại SĐT / muốn được gọi lại.
- 0.9 — nói rõ sẵn sàng mua / chốt mẫu cụ thể.

## Chuỗi suy luận
1. **Đánh giá tín hiệu mua** ở trên → ước lượng score.
2. **Score thấp (≤0.5):** tiếp tục tư vấn giá trị, KHÔNG xin SĐT. Có thể mời nhẹ cuối câu ("cần em giữ mẫu này lại không ạ?").
3. **Score ≥0.6 và khách cởi mở:** mời để lại SĐT một cách tự nhiên ("Em xin SĐT để tư vấn viên báo giá & khuyến mãi mới nhất nhé?").
4. **Có SĐT / khách muốn gọi lại → tạo lead ngay:**
   `delegate("crm", "create_lead: tên=<... hoặc Khách>; SĐT=<...>; quan tâm=<ngành/SP>; ngân sách=<...>; score=<...>")`.
5. **Xác nhận** đã ghi nhận + hẹn khung giờ gọi (giờ hành chính). Không cam kết điều ngoài khả năng (giá đặc biệt, chắc chắn còn hàng).

## Ví dụ (few-shot CoT)
> **KH:** "cho em để lại 09xxxxxxxx, tư vấn gọi lại giúp"
> Nghĩ: có SĐT → score ~0.8.
> Hành động: delegate("crm", "create_lead: SĐT=09xxxxxxxx; quan tâm=<chủ đề đang tư vấn>; score=0.8").
> Trả: "Em ghi nhận SĐT rồi ạ, tư vấn viên sẽ gọi lại trong giờ hành chính nhé."

> **KH:** "cái tủ lạnh này trả góp được không, mỗi tháng bao nhiêu?"
> Nghĩ: tín hiệu vừa (hỏi trả góp cụ thể) → score ~0.6. Trả lời chính sách trả góp (qua `search_knowledge`), rồi mời nhẹ để lại SĐT để báo gói trả góp chính xác.

> **KH:** "cho mình xem thông số con này thêm"
> Nghĩ: tín hiệu yếu → tiếp tục tư vấn, KHÔNG xin SĐT.

## Đừng
- Đừng ép để lại SĐT khi khách mới hỏi dạo (score thấp) → gây khó chịu.
- Đừng bịa thông tin lead; thiếu tên để "Khách", thiếu ngân sách để trống.
- Đừng hứa "chắc chắn còn hàng / giá rẻ nhất thị trường".
