---
name: compare_products
description: So sánh 2–5 sản phẩm cùng ngành, giải thích trade-off dễ hiểu.
agents: [lead, catalog]
---

# So sánh sản phẩm & giải thích trade-off (CoT chi tiết)

## Mục tiêu (đề bài — tiêu chí chấm 10%)
So sánh nhiều sản phẩm bằng **ngôn ngữ dễ hiểu, tập trung lợi ích thực tế** — KHÔNG chỉ đặt bảng thông số cạnh nhau. Nêu rõ **ưu/nhược của từng lựa chọn** và **trade-off** để khách tự quyết.

## Khi nào dùng
Khách muốn so sánh, đang phân vân giữa vài mẫu, hỏi "cái nào tốt hơn", hoặc ngay sau khi đã đưa top 3.

## Chuỗi suy luận
1. **Đã có SKU chưa?**
   - Khách nêu tên/mã cụ thể → lấy đúng các SKU đó.
   - Chưa có → gọi `recommend_top3` hoặc `search_products` trước để lấy 2–3 SKU **cùng ngành**, rồi mới so sánh.
2. **Gọi** `compare_products("<sku1>,<sku2>,<sku3>")` (2–5 SKU, PHẢI cùng ngành). Kết quả trả về các trục trade-off + giá + ★ + lượt bán.
3. **Xác định TRỤC so sánh khách quan tâm** dựa vào nhu cầu đã biết (ví dụ khách cần phòng ngủ → trục "độ ồn"; cần game → trục "chip/RAM").
4. **Diễn giải theo LỢI ÍCH thực tế** (dịch spec → đời thường, xem `explain_specs_plainly`):
   - **Tủ lạnh:** dung tích (đủ mấy người), ngăn đá lớn/nhỏ, điện/năm (tốn điện hơn bao nhiêu), kiểu tủ (chỗ đặt).
   - **Máy lạnh:** công suất theo m² (mát đủ không), độ ồn (êm cho phòng ngủ), inverter (tiết kiệm điện), 1/2 chiều.
   - **Điện thoại:** chip/RAM (mượt & chơi game), pin + sạc (dùng bao lâu, sạc nhanh không), bộ nhớ, camera.
   - **Laptop:** card rời vs tích hợp (chơi game/đồ họa được không), RAM/SSD, pin & cân nặng (mang đi).
   - **Tivi:** inch theo khoảng cách xem, tấm nền (OLED/QLED/LED — độ nét & giá), tần số quét (mượt cho game).
5. **Kết luận CÓ ĐỊNH HƯỚNG** (không chung chung "cái nào cũng tốt"): "Nếu ưu tiên [X] → chọn A vì…; nếu muốn tiết kiệm hơn → chọn B, chấp nhận [nhược điểm]."

## Ví dụ tình huống (few-shot CoT)
> **KH:** "so sánh 358683 với 360309"
> Nghĩ: 2 SKU cùng ngành điện thoại.
> Gọi: compare_products("358683,360309").
> Trình bày: "Mẫu A pin lớn hơn (dùng lâu hơn) và rẻ hơn ~1 triệu; mẫu B chip mạnh hơn nên chơi game nặng mượt hơn. Nếu ưu tiên pin & giá → A; ưu tiên chiến game → B." + ★/đã bán + nguồn SKU.

> **KH (sau khi có top 3 tủ lạnh):** "2 cái đầu khác nhau chỗ nào?"
> Gọi compare_products với 2 SKU đầu.
> Trình bày: "Mẫu 1 dung tích lớn hơn ~50 lít (trữ nhiều hơn) nhưng tốn điện hơn chút; mẫu 2 tiết kiệm điện hơn và rẻ hơn, đủ cho gia đình 4 người. Nhà hay trữ đồ → mẫu 1; ưu tiên tiết kiệm → mẫu 2."

> **KH:** "so sánh iphone với cái tủ lạnh kia"  (khác ngành)
> Trả lời: "Hai sản phẩm khác nhóm nên không so sánh trực tiếp được ạ. Anh/chị muốn em so sánh trong cùng nhóm nào?"

## Đừng
- Đừng so sánh sản phẩm khác ngành nhau.
- Đừng chỉ liệt kê số liệu song song mà không nói lợi ích/định hướng.
- Đừng khẳng định "còn hàng"; luôn dẫn nguồn SKU khi nêu số; số nào tool không có → nói "chưa có dữ liệu".
