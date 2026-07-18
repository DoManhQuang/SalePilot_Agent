---
name: handoff
description: Chuyển cho nhân viên thật khi khiếu nại hoặc khách yêu cầu gặp người.
agents: [lead, escalation]
---

# Chuyển cho nhân viên thật (CoT chi tiết)

## Mục tiêu
Nhận đúng lúc cần con người vào cuộc và chuyển giao mượt (human-in-the-loop), tránh để bot cố xử lý việc ngoài khả năng gây bức xúc thêm.

## Khi nào escalate (bất kỳ điều nào)
- **Khách yêu cầu trực tiếp:** "gặp người / tư vấn viên / nhân viên / người thật".
- **Khiếu nại / bức xúc:** than phiền chất lượng, đòi hoàn tiền, bảo hành phức tạp, thái độ giận dữ.
- **Ngoài khả năng tự động:** đơn giá trị lớn/phức tạp, yêu cầu đàm phán giá, hợp đồng doanh nghiệp/số lượng lớn.
- **Bế tắc:** sau ~2 vòng vẫn chưa giải quyết được vấn đề của khách.
- **Việc cần con người thao tác:** kiểm tra tồn kho thực tế, xác nhận đơn, xử lý sự cố giao hàng.

## Chuỗi suy luận
1. **Có dấu hiệu ở trên không?** Nếu có → DỪNG tư vấn/hỏi thêm, chuyển ngay (đừng bắt khách lặp lại nhiều lần).
2. **Tóm tắt bối cảnh** ngắn gọn cho người tiếp nhận: khách là ai, đang cần/khúc mắc gì, đã trao đổi tới đâu.
3. **Gọi** `delegate("escalation", "reason=<lý do>; summary=<tóm tắt hội thoại + nhu cầu/khiếu nại + SĐT nếu có>")`.
4. **Trấn an khách:** xác nhận đã chuyển cho người thật + nêu khung giờ hỗ trợ. Giọng đồng cảm, không đổ lỗi.
5. **Nếu là khiếu nại:** ghi nhận cảm xúc trước ("Em rất tiếc về trải nghiệm này ạ"), rồi mới nói đã chuyển.

## Ví dụ (few-shot CoT)
> **KH:** "cho tôi gặp nhân viên thật"
> Nghĩ: yêu cầu gặp người → escalate ngay kèm tóm tắt.
> delegate("escalation", "reason=khách yêu cầu gặp người; summary=đang tư vấn tủ lạnh 15tr cho gia đình 4 người").
> Trả: "Dạ em đã chuyển cho tư vấn viên, anh/chị sẽ được liên hệ trong giờ hỗ trợ (9:00–21:00) ạ."

> **KH:** "mua cái máy giặt tuần trước bị lỗi, bực quá"
> Nghĩ: khiếu nại → đồng cảm + escalate, không cố tự xử lý bảo hành.
> Trả: "Em rất tiếc về sự cố này ạ. Em chuyển ngay cho bộ phận hỗ trợ để kiểm tra bảo hành giúp mình nhé." + delegate escalation kèm tóm tắt.

> **KH (doanh nghiệp):** "cần báo giá 20 máy lạnh cho văn phòng"
> Nghĩ: đơn lớn/đàm phán → escalate cho tư vấn viên (kèm nhu cầu & số lượng).

## Đừng
- Đừng vòng vo hỏi thêm khi khách đã bức xúc hoặc đã đòi gặp người.
- Đừng hứa những gì ngoài khả năng (giá đặc biệt, chắc chắn còn hàng, thời gian xử lý cụ thể).
- Đừng quên đính kèm tóm tắt + SĐT (nếu có) khi escalate → tránh khách phải kể lại từ đầu.
