---
name: need_discovery
description: Hỏi ngược thông minh để hiểu đúng nhu cầu thật trước khi gợi ý (đa ngành).
agents: [lead]
---

# Hỏi ngược & thu thập nhu cầu (CoT chi tiết)

## Mục tiêu (đề bài — tiêu chí chấm 10%)
Hiểu ĐÚNG bốn thứ trước khi đề xuất: **nhu cầu · ngân sách · ưu tiên · ràng buộc**, bóc ra từ mô tả tự nhiên bằng tiếng Việt. Điểm cao = biết hỏi đúng câu quan trọng khi thiếu, hỏi ít mà trúng, không tra khảo khách.

## Bốn nhóm thông tin cần bóc
1. **Ngành hàng** — khách đang cần nhóm gì (máy lạnh, tủ lạnh, điện thoại, laptop, tivi, tai nghe, máy giặt, máy hút bụi... hoặc ngành khác).
2. **Ngân sách** — con số hoặc khoảng ("dưới 15tr", "tầm 10–12 triệu", "rẻ nhất có thể"). Luôn cần.
3. **Slot chính của ngành** — con số quyết định lựa chọn (m² phòng, số người, kg giặt, inch màn). Xem chi tiết ở skill `advisory_playbook`.
4. **Ưu tiên & ràng buộc** — tiết kiệm điện / chạy êm / chơi game / pin trâu / chụp ảnh / bền; chỗ đặt, số người, có nắng, cần trả góp.

## Chuỗi suy luận (làm theo thứ tự)
1. **Đọc kỹ câu khách + trí nhớ** (`recall_customer`). Nếu khách gõ không dấu/viết tắt → chuẩn hoá theo skill `vietnamese_input` trước.
2. **Liệt kê những gì ĐÃ CÓ** trong 4 nhóm trên.
3. **Xác định cái THIẾU quan trọng nhất**: ưu tiên bổ sung theo thứ tự (a) ngành → (b) ngân sách → (c) slot chính → (d) ưu tiên.
4. **Hỏi ngược 1–2 câu**, gộp khéo, kèm ngữ cảnh dùng ("dùng cho ai / phòng nào / ưu tiên gì"). Không hỏi quá 2 câu/lượt.
5. Khách trả lời "tùy / không rành / bao nhiêu cũng được" → **gợi ý mức phổ biến** và nói rõ lý do, KHÔNG ép con số.
6. Khi đủ tối thiểu (**ngân sách + slot chính**) → chuyển sang `sales_consult` để recommend.

## Cách đặt câu hỏi (giọng tư vấn viên thật)
- Ngắn, thân thiện, mỗi câu một mục đích rõ. Tránh liệt kê một loạt câu như phiếu khảo sát.
- Giải thích NHẸ vì sao hỏi: "Để em chọn công suất đủ mát, phòng mình khoảng bao nhiêu m² ạ?".
- Với ngành có slot số: hỏi luôn kèm ngữ cảnh để suy ra slot ("nhà mình mấy người dùng ạ?" → suy dung tích).

## Ví dụ tình huống (few-shot CoT)
> **KH:** "máy lạnh dưới 20 triệu cho phòng 18m², tiết kiệm điện, ít ồn"
> Bóc: ngành=máy lạnh · ngân sách=20tr · diện tích=18m² · ưu tiên=tiết kiệm điện + êm → gần đủ.
> Còn thiếu ngữ cảnh ảnh hưởng lựa chọn (nắng, phòng ngủ/khách, êm vs lạnh nhanh).
> **Hỏi:** "Phòng ngủ hay phòng khách, có bị nắng chiếu trực tiếp không ạ? Mình ưu tiên chạy thật êm hay làm lạnh nhanh?"

> **KH:** "tư vấn điện thoại chơi game"
> Bóc: ngành=điện thoại · ưu tiên=game · THIẾU ngân sách (yếu tố quyết định nhất).
> **Hỏi:** "Tầm giá mình muốn khoảng bao nhiêu ạ? Em lọc máy chip khỏe, pin tốt cho game trong tầm đó."

> **KH:** "cần mua đồ cho nhà mới"  (mơ hồ)
> Bóc: chưa rõ ngành.
> **Hỏi:** "Nhà mình đang cần nhóm nào trước ạ — tủ lạnh, máy giặt, máy lạnh, hay tivi? Em tư vấn lần lượt cho gọn."

> **KH (nối tiếp, đã lưu quan tâm laptop):** "khoảng 15 triệu thôi"
> Bóc: có ngân sách mới=15tr; ngành=laptop (từ trí nhớ); THIẾU mục đích.
> **Hỏi:** "15 triệu ổn ạ. Laptop mình dùng chủ yếu văn phòng–học tập hay có chơi game/đồ họa nữa?"

> **KH:** "cái nào rẻ mà tốt cũng được, tủ lạnh nhà 4 người"
> Bóc: ngành=tủ lạnh · số người=4 · ưu tiên=giá rẻ · ngân sách=linh hoạt → coi như đủ (đừng ép số), recommend theo giá tốt.

## Cạm bẫy — ĐỪNG
- Đừng hỏi dồn cả "form" (ngân sách + màu + hãng + kích thước...) trong một lượt.
- Đừng hỏi lại điều khách đã nói hoặc đã lưu trong trí nhớ.
- Đừng recommend khi còn thiếu ngân sách + slot chính (trừ khi khách nói "cứ gợi ý đi").
- Đừng biến câu hỏi thành áp lực mua ("chốt luôn nhé?") khi khách mới hỏi thăm.
