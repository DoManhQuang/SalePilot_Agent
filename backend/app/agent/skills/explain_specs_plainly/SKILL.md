---
name: explain_specs_plainly
description: Giải thích thông số theo lợi ích thật, ngôn ngữ bình dân — không jargon marketing.
agents: [lead]
---

# Giải thích dễ hiểu — dịch spec sang lợi ích (CoT chi tiết)

## Mục tiêu (đề bài — I1 & tiêu chí 10%)
Khách phổ thông KHÔNG cần bảng thông số. Nhiệm vụ: dịch mỗi thông số kỹ thuật thành **lợi ích đời thường**, nói **bình dân, trung thực**, KHÔNG dùng từ marketing, KHÔNG phóng đại, KHÔNG tạo cảm giác ép mua.

## Từ điển dịch spec → lợi ích

### Máy lạnh
- BTU/HP → "đủ mát cho phòng ~X m²" (đừng nói trơ "12.000 BTU").
- Inverter → "chạy tiết kiệm điện, hoá đơn nhẹ hơn về lâu dài".
- Độ ồn thấp (dB) → "chạy êm, ngủ không bị ồn".
- 2 chiều → "có sưởi ấm mùa đông".
- Làm lạnh nhanh → "vào phòng là mát ngay".

### Tủ lạnh
- Dung tích (lít) → "đủ trữ cho ~X người / đi chợ 1 lần cho cả tuần".
- Inverter → "tiết kiệm điện, chạy êm".
- Side by Side / Multi Door → "rộng rãi, nhiều ngăn, hợp nhà đông".
- Ngăn đá lớn → "trữ được nhiều đồ đông".

### Điện thoại
- Chip + RAM cao → "mở nhiều app, chơi game mượt không giật".
- Pin (mAh) lớn → "dùng thoải mái cả ngày không lo hết pin".
- Sạc nhanh (W) → "sạc 30 phút đã dùng được lâu".
- Camera tốt → "chụp ảnh nét, đẹp cả khi thiếu sáng".
- Bộ nhớ lớn → "lưu nhiều ảnh/video không lo đầy".

### Laptop
- Card rời (RTX/GTX) → "chơi game nặng, dựng phim/đồ họa được".
- Card tích hợp → "hợp văn phòng, học tập, xem phim".
- RAM ≥16GB → "mở nhiều tab, chạy nhiều phần mềm cùng lúc mượt".
- SSD → "khởi động & mở app nhanh".
- Pin (Wh) lớn + mỏng nhẹ → "mang đi cả ngày, gọn nhẹ".

### Tivi
- Inch → "màn lớn xem đã mắt" (gắn với khoảng cách ngồi).
- 4K / OLED / QLED → "hình sắc nét, màu đẹp".
- Tần số quét cao (120Hz) → "chuyển động mượt, xem đá bóng/chơi game không mờ".

### Loa & tai nghe / hút bụi
- Công suất (W) loa → "âm to, đủ mở party".
- Chống ồn → "yên tĩnh, tập trung".
- Lực hút (Pa) → "hút sạch cả bụi mịn, lông thú".

## Cách trình bày
- Mỗi sản phẩm: **1 câu "hợp với ai / việc gì"** thay vì đọc cả bảng.
- **Trung thực**: nêu cả điểm chưa mạnh — "mẫu này pin thường, bù lại giá rẻ". Không SP nào cũng khen.
- Ưu tiên lợi ích khách quan tâm nhất (đã bóc ở `need_discovery`).

## Từ NÊN tránh (marketing rỗng) → thay bằng
- "đỉnh cao / siêu phẩm / flagship / công nghệ độc quyền" → nói cụ thể lợi ích.
- "cực kỳ mạnh mẽ" → "chơi game nặng vẫn mượt".
- "thời thượng / đẳng cấp" → mô tả thật (thiết kế mỏng, màu đẹp).

## Ví dụ
> **Thay vì:** "Snapdragon 8 Elite, 120Hz, 5000mAh, sạc 80W."
> **Nói:** "Máy này chip khỏe nên chơi game nặng vẫn mượt, pin dùng thoải mái cả ngày, sạc 30 phút là đủ xài lâu, màn hình lướt rất êm tay."

> **Thay vì:** "Inverter, 1.5HP, 12.000 BTU, 19dB."
> **Nói:** "Cái này đủ mát cho phòng ~18m², chạy rất êm nên ngủ ngon, lại tiết kiệm điện nhờ inverter."
