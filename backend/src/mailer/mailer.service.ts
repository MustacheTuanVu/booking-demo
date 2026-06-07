import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { TypeTicket } from 'src/ticket/enum/type.enum';
import { UserModel } from 'src/users/model/user.model';

@Injectable()
export class MailerService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            // Cấu hình transporter, ví dụ sử dụng SMTP
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'booking.queenacoustic@gmail.com',
                pass: 'iugn itgb xzcf epvk',
            },
        });
    }

    async generateQrCode(data: string): Promise<string> {
        return await QRCode.toDataURL(data);
    }

    async sendEmailNewPassword(to: string, user: UserModel, newPass: string) {
        const userName = user?.name || 'Người dùng';

        const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Xin chào ${userName},</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <p><strong>Mật khẩu mới của bạn là:</strong></p>
        <p style="font-size: 18px; color: #d32f2f;"><strong>${newPass}</strong></p>
        <p>Hãy đăng nhập và đổi mật khẩu ngay để bảo vệ tài khoản của bạn.</p>
        <br>
        <p>Trân trọng,</p>
        <p>Đội ngũ hỗ trợ</p>
      </div>
    `;

        const mailOptions = {
            from: 'no-reply@gmail.com', // Địa chỉ email người gửi
            to: to, // Địa chỉ email người nhận
            subject: `THÔNG TIN MẬT KHẨU TÀI KHOẢN `, // Chủ đề email
            html: htmlContent, // Nội dung HTML của email
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info);
            return { success: true, info };
        } catch (error) {
            console.log('Error occurred while sending email:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendEmailTicketStatus(to: string, user: UserModel, ticket: any, isSuccess: boolean) {
        const userName = user?.name || 'Người dùng';

        const statusText = isSuccess ? 'được xử lý thành công' : 'không thể xử lý';
        const subjectText = isSuccess
            ? 'THÔNG BÁO XỬ LÝ YÊU CẦU THÀNH CÔNG'
            : 'THÔNG BÁO XỬ LÝ YÊU CẦU THẤT BẠI';

        const htmlContent = `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    background-color: #f9f9f9; 
    padding: 20px; 
    border-radius: 10px; 
    color: #333; 
    max-width: 600px; 
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  ">
    <h2 style="color: #d32f2f;">Xin chào ${userName},</h2>
    <p>Chúng tôi rất tiếc khi phải thông báo rằng yêu cầu <strong style="color: #d32f2f;">"${ticket.title}"</strong> của bạn <strong style="color: #d32f2f;">không thành công</strong>.</p>

    <p style="margin-top: 16px;">
      Hiện tại chúng tôi chưa thể xử lý yêu cầu này. Bạn vui lòng kiểm tra lại thông tin hoặc liên hệ với bộ phận hỗ trợ để được trợ giúp thêm.
    </p>

    <p style="margin-top: 16px;">
      Bạn có thể tham khảo chính sách hỗ trợ và quyền lợi tại:
      <a href="https://www.queenacoustic.vn/affiliate" target="_blank" style="color: #1976d2; text-decoration: none;">
        https://www.queenacoustic.vn/affiliate
      </a>
    </p>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">

    <p style="font-style: italic;">Trân trọng,</p>
    <p><strong>Đội ngũ hỗ trợ Queen Acoustic</strong></p>
  </div>
`;


        const htmlCTV = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Chào Mừng Cộng Tác Viên</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; background-color: #f9f9f9;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    <p>Xin chào <strong>${userName}</strong>,</p>

    <p>Cảm ơn bạn đã quan tâm và đăng ký tham gia chương trình <strong>Cộng Tác Viên Tiếp Thị Liên Kết</strong> tại <strong>Queen Acoustic</strong>!</p>

    <p style="font-size: 18px;">🎉 <strong>Yêu cầu của bạn đã được duyệt thành công.</strong></p>

    <p>Tuy nhiên, để chính thức bắt đầu sử dụng mã giới thiệu, theo dõi đơn hàng và tích điểm đổi thưởng, bạn cần hoàn tất bước cuối cùng như sau:</p>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

    <h3 style="color: #28a745;">BƯỚC XÁC NHẬN BẮT BUỘC:</h3>
    
    <p>📌 Vui lòng truy cập đường dẫn dưới đây và <strong>điền đầy đủ thông tin cá nhân</strong> (Họ tên, Email, SĐT…)</p>
    <p>Đồng thời <strong>tích chọn xác nhận đã đọc và đồng ý chính sách liên kết</strong> của chương trình.</p>

    <p style="margin-top: 20px; font-size: 16px;">
      🔗 <strong>Link form xác nhận:</strong><br/>
      👉 <a href="https://www.queenacoustic.vn/affiliate" target="_blank" style="color: #007bff; text-decoration: none;">https://www.queenacoustic.vn/affiliate</a>
    </p>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

    <p>📝 Sau khi gửi form thành công, bạn sẽ được:</p>
    <ul>
      <li><strong>Kích hoạt tài khoản CTV chính thức</strong></li>
      <li><strong>Nhận mã giới thiệu cá nhân (ref link)</strong></li>
      <li>Theo dõi <strong>số đơn hàng giới thiệu thành công</strong></li>
      <li>Tích điểm và <strong>đổi thưởng/voucher</strong> theo chính sách</li>
    </ul>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

    <p>Trân trọng,<br/>Đội ngũ hỗ trợ Queen Acoustic</p>
  </div>
</body>
</html>
`;
    const htmlComplaints = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Thông báo phản hồi yêu cầu quy đổi</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; background-color: #f9f9f9;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    <p>Xin chào <strong>${userName}</strong>,</p>

    <p>Chúng tôi xin thông báo rằng ${isSuccess ? '<strong>Yêu Cầu Quy Đổi Điểm Của Bạn Đã Được Xử Lý Thành Công</strong> 🎉.' : '<strong>Yêu Cầu Quy Đổi Điểm Của Bạn Không Thể Xử Lý</strong>'}</p>

    <p><strong>📌 Thông tin chi tiết yêu cầu:</strong></p>
    <p>
        - 📅 Ngày gửi yêu cầu: 
        ${new Date(ticket.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })}
    </p>
    <p> - 💰 Giá trị quy đổi: ${ticket.price.toLocaleString()} điểm ≈  ${ticket.price.toLocaleString()} VNĐ </p>
    <p> - 🔄 Hình thức quy đổi: Chuyển khoản ngân hàng </p>
    <p> - 🧾 Mã yêu cầu: ${ticket._id} </p>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

    ${
        isSuccess
            ? `<p>✅ <strong>Trạng thái</strong>:</p>
                <p>🔹 Đã hoàn tất và xác nhận thanh toán vào ngày: 
                    ${new Date(ticket.updatedAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })}
                </p>
                <p>💳 Hình thức <strong>chuyển khoản ngân hàng</strong>, vui lòng kiểm tra lại thông tin trong tài khoản ngân hàng đã đăng ký.</p>`
            : `<p>Vui lòng kiểm tra lại thông tin yêu cầu hoặc liên hệ bộ phận hỗ trợ để được hướng dẫn chi tiết.</p>`
    }

    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

    <p>🧾 Mọi yêu cầu được ghi nhận và lưu trữ trong lịch sử tại: </p>
    <p style="margin-top: 20px; font-size: 16px;">
      🔗 <strong>Đường dẫn:</strong><br/>
      👉 <a href="https://booking.queenacoustic.vn/customer/history-request" target="_blank" style="color: #007bff; text-decoration: none;">https://booking.queenacoustic.vn/customer/history-request</a>
    </p>

    <p> Nếu có thắc mắc, bạn liên hệ bộ phận hỗ trợ để được xử lý kịp thời. </p>

    <p>Trân trọng,<br/>Đội ngũ hỗ trợ Queen Acoustic</p>

    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

    <p><strong>Email được gửi tự động. Vui lòng không phản hồi.</strong></p>
  </div>
</body>
</html>`;

        let mailOptions = null;
        if (isSuccess) {
            mailOptions = {
                from: 'no-reply@gmail.com',
                to: to,
                subject: ticket.type === TypeTicket.COLLABORATOR ? 'Chào Mừng Cộng Tác Viên' : ticket.type === TypeTicket.COMPLAINTS ? 'Thông báo phản hồi yêu cầu quy đổi' : subjectText,
                html: ticket.type === TypeTicket.COLLABORATOR ? htmlCTV : ticket.type === TypeTicket.COMPLAINTS ? htmlComplaints : htmlContent,
            };
        } else {
            mailOptions = {
                from: 'no-reply@gmail.com',
                to: to,
                subject: subjectText,
                html: htmlContent,
            };
        }
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email ticket status sent:', info);
            return { success: true, info };
        } catch (error) {
            console.log('Error sending ticket email:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendEmailPaid(to: string, user: string, order: any, link: string, userInfo?: UserModel) {
        const qrCodeData = userInfo
            ? await this.generateQrCode(
                  `Tên KH: ${userInfo.name}; SĐT: ${userInfo.phone}; Email: ${userInfo.email}`,
              )
            : await this.generateQrCode(order.code);
        const qrCodeBuffer = Buffer.from(qrCodeData.split(',')[1], 'base64');
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; width: 600px;">
          <h2 style="color: #333;">Thông tin đặt chỗ</h2>
          <p>Xin chào <strong>${user}</strong>,</p>
          <p>Cảm ơn bạn đã đặt chỗ. Dưới đây là thông tin chi tiết đặt chỗ của bạn:</p>
          
          <table style="width: 100%; border-collapse: collapse;">
              <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;"><strong>Mã đặt chỗ:</strong></td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${order.code}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;"><strong>Tổng tiền:</strong></td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${order.total_price.toLocaleString()} VND</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;"><strong>Trạng thái:</strong></td>
                  <td style="border: 1px solid #ddd; padding: 8px;">Thanh toán thành công</td>
              </tr>
              ${
                  order.promotion
                      ? `
              <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;"><strong>Khuyến mãi:</strong></td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${order.promotion.name} (-${order.promotion.price.toLocaleString()} ${order.promotion.type_price})</td>
              </tr>
              `
                      : ''
              } 
          </table>
          
          <p>Vui lòng kiểm tra lại thông tin đặt chỗ. Để biết thêm chi tiết, bạn có thể truy cập:</p>
          <p><a href="${link}" style="color: #007bff; text-decoration: none;">Xem chi tiết đặt chỗ</a></p>
          
          <p>Trân trọng,</p>
          <p><strong>Đội ngũ hỗ trợ</strong></p>
      </div>
    `;

        const mailOptions = {
            from: 'no-reply@gmail.com', // Địa chỉ email người gửi
            to: to, // Địa chỉ email người nhận
            subject: `THÔNG TIN HÓA ĐƠN - [HD - ${order.code}] `, // Chủ đề email
            html: htmlContent, // Nội dung HTML của email
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrCodeBuffer,
                    encoding: 'base64',
                },
            ],
        };

        // Sử dụng async/await thay vì callback
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info);
            return { success: true, info };
        } catch (error) {
            console.log('Error occurred while sending email:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendEmailMembership(
        to: string,
        user: string,
        membershipInfo: any,
        link: string,
        txnRef: any,
    ) {
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; width: 600px;">
          <h2 style="color: #333;">Thông Tin Thẻ Thành Viên</h2>
          <p>Xin chào <strong>${user}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký thẻ thành viên. Dưới đây là thông tin chi tiết về thẻ thành viên của bạn:</p>
          
          <table style="width: 100%; border-collapse: collapse;">
              <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;"><strong>Loại thẻ:</strong></td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${txnRef}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;"><strong>Trạng thái:</strong></td>
                  <td style="border: 1px solid #ddd; padding: 8px;">Đã kích hoạt</td>
              </tr>
          </table>
          
          <p>Vui lòng kiểm tra lại thông tin thẻ thành viên. Để biết thêm chi tiết, bạn có thể truy cập:</p>
          <p><a href="${link}" style="color: #007bff; text-decoration: none;">Xem chi tiết thẻ thành viên</a></p>
          
          <p>Trân trọng,</p>
          <p><strong>Đội ngũ hỗ trợ</strong></p>
      </div>
    `;

        const mailOptions = {
            from: 'no-reply@gmail.com', // Địa chỉ email người gửi
            to: to, // Địa chỉ email người nhận
            subject: `THÔNG TIN THẺ THÀNH VIÊN`, // Chủ đề email
            html: htmlContent, // Nội dung HTML của email
        };

        // Sử dụng async/await thay vì callback
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info);
            return { success: true, info };
        } catch (error) {
            console.log('Error occurred while sending email:', error.message);
            return { success: false, error: error.message };
        }
    }
}
