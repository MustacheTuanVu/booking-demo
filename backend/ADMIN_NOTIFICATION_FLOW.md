# Luồng thông báo Admin

## Kiến trúc

Thông báo dùng Socket.IO và `RuntimeStateService`. Service giữ danh sách socket ID trong bộ nhớ của process backend:

- Socket admin/BOSS nằm trong nhóm internal.
- Socket khách hàng được nhóm theo `event_id_showtimes_id`.
- Khi socket disconnect, ID được xóa khỏi nhóm tương ứng.

Không cần dịch vụ lưu trữ trạng thái bên ngoài. Cấu hình này phù hợp khi backend chạy một instance.

## Luồng kết nối

1. `GatewayWebSocket.handleConnection()` xác thực token.
2. Admin/BOSS được thêm bằng `GatewayService.addInternalUser()`.
3. Khách hàng được thêm bằng `GatewayService.addUserToEvent()`.
4. `GatewayWebSocket.sendDataSeat()` lấy danh sách socket của sự kiện và phát trạng thái ghế.
5. Khi thanh toán hoặc hủy đơn, `OrdersService` lấy nhóm internal và gửi `PAID_INVOICE` hoặc `ORDER_CANCELED`.
6. `handleDisconnect()` loại socket khỏi runtime state.

## Giới hạn triển khai

Socket state chỉ tồn tại trong RAM và được xóa khi backend restart. Timer order `PENDING` được phục hồi từ MongoDB khi khởi động. Nếu triển khai nhiều instance, cần sticky session hoặc một state adapter dùng chung; nếu không, mỗi instance chỉ gửi được tới các socket đang kết nối trực tiếp với nó.
