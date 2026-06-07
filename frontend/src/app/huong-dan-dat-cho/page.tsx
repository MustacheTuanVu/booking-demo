'use client';
import React, { useEffect } from 'react';
import { Box, Container, Typography, List, ListItem, Paper } from '@mui/material';
import Link from 'next/link';
import { useSectionRefs } from '@/context/SectionContext';

const TermsPage = () => {
  const sectionRefs = useSectionRefs();
  useEffect(() => {
    // Kiểm tra nếu có section cần cuộn khi trang vừa tải
    const section = localStorage.getItem("scrollToSection");
    if (section) {
      localStorage.removeItem("scrollToSection");
      setTimeout(() => {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
          const topOffset = 100; // Set the offset here (60px)
          const elementTop = sectionElement.getBoundingClientRect().top + window.pageYOffset; // Get the position of the element relative to the document
          window.scrollTo({
            top: elementTop - topOffset, // Scroll to the element with the offset
            behavior: "smooth",
          });
        }
      }, 100); // Đợi một chút để đảm bảo DOM đã render xong
    }
  }, []);
  return (
    <>
      <Box sx={{ py: 6, backgroundColor: 'var(--clr-bg)' }}>
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
            <Typography variant="h3" sx={{
              textAlign: 'center',
              my: 4,
              fontWeight: 'bold',
              color: 'var(--clr-txt-5)',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '3px',
                backgroundColor: 'var(--clr-txt-2)'
              }
            }}>
              ĐIỀU KHOẢN VÀ CHÍNH SÁCH
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
              Chào mừng các bạn đã đến với Queen Acoustic! Trước khi đặt chỗ, vui lòng đọc kỹ điều khoản, chính sách sau
              để hiểu rõ về những quyền lợi và trách nhiệm của mỗi bên.
            </Typography>

            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                I. CHÍNH SÁCH ĐẶT CHỖ VÀ THANH TOÁN
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Giá trên đã bao gồm VAT.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Khi đặt bàn qua website, hãy chắc chắn rằng bạn đã cung cấp đầy đủ thông tin chính xác để chúng tôi có thể liên hệ khi cần thiết.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Việc thanh toán trực tuyến (TTOL) sẽ tự động duy trì chỗ của bạn trong thời gian chờ đợi cho máy chủ nếu hệ thống thanh toán hoạt động bình thường.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Các mã giảm giá chỉ áp dụng khi đặt chỗ trực tiếp tại website booking.queenacoustic.vn
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Trẻ em cao dưới 1m: Miễn phí chỗ ngồi, nhưng vẫn phải hợp thức hóa trong suốt thời gian diễn ra show.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Khi bạn cần hủy định trực tiếp tại chỗ chờ: Đặt cọc, ảnh hộ 70% hoặc toàn bộ (tuỳ chương trình).
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Khách hàng được phép hoàn/hủy đặt chỗ nếu thực hiện trước khi show được diễn ra ít nhất 24 giờ thông tin trước khi cuộc hẹn bắt đầu và chương trình hoàn tiền sẽ được thực hiện.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Mọi khách vui lòng thao tác đặt chỗ và thanh toán trong vòng 5 phút sau khi chọn vị trí chỗ ngồi để tránh bị hủy chỗ tự động nếu hết hạn.
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                II. CHÍNH SÁCH XỬ LÝ KHIẾU NẠI
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Mọi đóng góp/ý kiến/khiếu nại của Quý Khách liên quan đến việc sử dụng dịch vụ của Queen Acoustic, xin gửi về địa chỉ email: <Link href="mailto:queen.accoustic47@gmail.com" style={{ color: 'var(--clr-txt-2)' }}>queen.accoustic47@gmail.com</Link>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Thời gian giải quyết khiếu nại mỗi trường hợp tùy từ 03 đến 05 ngày làm việc kể từ khi nhận được khiếu nại của khách hàng. Trong trường hợp đặc biệt thì không quá 7 ngày.
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                III. CHÍNH SÁCH GIAO NHẬN
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Sau khi hoàn thành việc thanh toán trực tuyến, Quý Khách sẽ nhận được thư xác nhận thông tin chi tiết về giá đặt chỗ qua địa chỉ thư điện tử (email) mà Quý Khách đã cung cấp.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Trường hợp đi phút 89 và Nếu Quý Khách thanh toán thành công mà vẫn chưa nhận được bất kỳ xác nhận nào, vui lòng liên hệ chúng tôi qua Hotline (1900 5225) hoặc Fanpage để được hỗ trợ.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Nếu không thể liên lạc được với Quý Khách theo thông tin đã cung cấp, Queen Acoustic sẽ hoàn thành nghĩa vụ đặt chỗ và không chịu trách nhiệm thông báo.
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                IV. CHÍNH SÁCH HỦY
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Đơn hàng đã đặt không được đổi trả, hoàn tiền.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Queen Acoustic có quyền từ chối yêu cầu hoàn tiền hoặc hủy chỗ nếu quý khách vi phạm quy định.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Trong trường hợp sự kiện bất khả kháng (thiên tai, dịch bệnh,...) dẫn đến việc hủy chỗ, Queen Acoustic sẽ hỗ trợ chuyển ngày hoặc hoàn tiền tối đa theo quy định.
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                V. CHÍNH SÁCH BẢO LƯU
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Đối với trường hợp hóa đơn đã đặt, các thông báo đến bộ phận Chăm sóc Khách Hàng của Queen Acoustic 24h trước khi buổi diễn bắt đầu. (Nếu không thực hiện TTOL sẽ không bảo lưu)
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Thông tin bảo lưu được áp dụng tại các chi nhánh của Queen Acoustic.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Đơn hàng đã thanh toán trực tuyến sẽ được xác nhận bảo lưu.
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                VI. CHÍNH SÁCH BẢO MẬT THÔNG TIN
              </Typography>
              <Box sx={{ pl: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>1. Mục đích thu thập thông tin của Khách hàng:</Typography>
                <List sx={{ pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Queen Acoustic không được phép tiết lộ thay trừm thông tin cá nhân của Quý khách thứ ba biết trên trang mạng này mới biên hệ nào khác.
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Thông tin cá nhân thu thập được chỉ được sử dụng trong nội bộ công ty.
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Khi khách hàng lên hệ đăng ký dịch vụ, thông tin cá nhân mà Queen Acoustic thu thập bao gồm:
                    <List sx={{ pl: 5, mt: 1 }}>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Họ tên</ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Điện thoại</ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Email</ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Thông tin về thẻ</ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Số lượng</ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Phương thức thanh toán lên</ListItem>
                    </List>
                  </ListItem>
                </List>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>2. Phạm vi sử dụng thông tin:</Typography>
                <List sx={{ pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Thông tin cá nhân thu thập được sẽ chi được Queen Acoustic sử dụng trong nội bộ công ty và cho mục đích mà thông tin được thu thập.
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Cung cấp thông tin lên quan đến dịch vụ.
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Xử lý đơn hàng, cung cấp dịch vụ và thông tin qua trang web booking.queenacoustic.vn theo yêu cầu của Quý Khách
                  </ListItem>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Nếu có rõ đề xuất trong đơn đặt dịch vụ của Quý khách, thông tin sẽ có thể được sử dụng để hướng dẫn hoặc thông tin liên lạc của Quý khách đăng ký nhận email thông báo về các dịch vụ cập nhật mới như: giảm giá/quà tặng liên quan đến những hàng hóa, dịch vụ của Queen Acoustic.
                  </ListItem>
                </List>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>3. Thời gian lưu trữ thông tin:</Typography>
                <List sx={{ pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Thông tin cá nhân khách hàng, thực chất Queen Acoustic chỉ lưu trữ cho đến khi người dùng có yêu cầu gỡ mail và văn bản để yêu cầu chúng tôi ngừng lưu trữ, hoặc Queen Acoustic không còn nhu cầu sử dụng để thực hiện mục dịch của công ty.
                  </ListItem>
                </List>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>4. Những người hoặc tổ chức có thể được tiếp cận với thông tin cá nhân:</Typography>
                <List sx={{ pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    CÔNG TY CỔ PHẦN QUEEN ACOUSTIC: Các đối tác cùng sử dụng thông tin này theo theo khóa thuận hợp pháp giao dịch với giải pháp hoặc bạn ngày thành lập có nghiêu đăng ký kinh doanh với do Công ty cung cấp.
                  </ListItem>
                </List>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>5. Địa chỉ đơn vị thu thập và quản lý thông tin cá nhân:</Typography>
                <Box sx={{ pl: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>Công ty Cổ phần Queen Lang Thang</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>Địa chỉ: Tầng 1, 15 Lê Đại Cang, P. Thành Công, Tp. Buôn Ma Thuột , Đắk Lắk</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>Điện thoại: 1900 5225</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>Website: booking.queenacoustic.vn</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>Email: queen.accoustic47@gmail.com</Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>6. Cơ chế tiếp nhận và giải quyết khiếu nại:</Typography>
                <List sx={{ pl: 3 }}>
                  <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                    Khi Queen Acoustic nhận được vê thông tin của Quý khách hàng được thông báo trong tài khoản, sẽ bị sự người năm thác. Queen Acoustic sẽ xem kết chi tiếp dụng các thông tin của Quý nhân viên rừ các trường hợp sau:
                    <List sx={{ pl: 5, mt: 1 }}>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Khi có yêu cầu của cơ quan pháp luật</ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Giải quyết các tranh chấp, khiếu nại</ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: '• ', py: 0.5 }}>Khi có sự đồng ý hoặc trọn của phụ huynh</ListItem>
                    </List>
                  </ListItem>
                </List>
              </Box>
            </Box>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                VII. CHÍNH SÁCH TIẾP THỊ LIÊN KẾT
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>Chương trình Tiếp Thị Liên Kết Queen Acoustic</strong>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Queen Acoustic mang đến cơ hội hợp tác dành cho những ai yêu thích âm nhạc và muốn kiếm thêm thu nhập thông qua chương trình tiếp thị liên kết.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Khi tham gia, bạn có thể giới thiệu khách hàng đặt chỗ tại Queen Acoustic và nhận hoa hồng hấp dẫn từ mỗi lượt đặt chỗ thành công.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>Lợi ích khi tham gia:</strong>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hoa hồng lên đến 10% trên mỗi lượt đặt chỗ hợp lệ.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Thanh toán định kỳ qua tài khoản ngân hàng hoặc ví điện tử.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hệ thống theo dõi đơn hàng minh bạch, báo cáo chi tiết theo thời gian thực.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Không yêu cầu vốn, dễ dàng tham gia và bắt đầu kiếm tiền ngay.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>Cách thức tham gia:</strong>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Đăng ký tài khoản tiếp thị liên kết tại <a href="https://booking.queenacoustic.vn" target="_blank" rel="noopener noreferrer">đây</a>.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Nhận đường link giới thiệu cá nhân và chia sẻ đến bạn bè, khách hàng trên mạng xã hội hoặc website.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Theo dõi đơn hàng và nhận hoa hồng khi khách đặt chỗ qua đường link của bạn.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  Hãy tham gia ngay để trở thành đối tác của Queen Acoustic và cùng lan tỏa niềm đam mê âm nhạc!
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                VIII. CHÍNH SÁCH THÀNH VIÊN
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>1. Hạng thẻ J – Đặc quyền cơ bản</strong>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hạng thẻ J dành cho những thành viên mới hoặc những khách hàng có mức độ sử dụng dịch vụ ở mức cơ bản.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Được đặt chỗ trong khoảng thời gian tiêu chuẩn.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hỗ trợ dịch vụ khách hàng 24/7.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Ưu đãi giảm giá cơ bản khi sử dụng dịch vụ.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Tham gia chương trình tích điểm để nâng cấp lên hạng thẻ cao hơn.
                </ListItem>

                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>2. Hạng thẻ Q – Đặc quyền được đặt chỗ sớm sau Hạng K</strong>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Được đặt chỗ sớm hơn so với hạng thẻ J, chỉ sau hạng thẻ K.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hỗ trợ ưu tiên khi có danh sách chờ.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Nhận ưu đãi đặc biệt vào những dịp quan trọng.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Được tiếp cận với các chương trình khuyến mãi dành riêng cho thành viên hạng Q.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Có thể tham gia sự kiện dành riêng cho thành viên cao cấp.
                </ListItem>

                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>3. Hạng thẻ K – Đặc quyền được đặt chỗ sớm nhất</strong>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Được đặt chỗ sớm nhất trước tất cả các hạng thẻ khác.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hỗ trợ đặc biệt khi có yêu cầu đặc biệt.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Nhận thông báo sớm về các chương trình khuyến mãi và sự kiện.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hưởng mức ưu đãi cao nhất trong hệ thống.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Được tham gia vào những sự kiện giới hạn chỉ dành cho hạng thẻ K.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Nhận quà tặng tri ân định kỳ.
                </ListItem>

                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>4. Hạng thẻ Khách Mời – Đặc quyền được đặt chỗ như Hạng thẻ K & Q</strong>
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hạng thẻ Khách Mời là hạng thẻ đặc biệt dành cho khách hàng VIP hoặc những người được mời tham gia chương trình thành viên.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Được đặt chỗ cùng với hạng thẻ K và Q.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Hỗ trợ ưu tiên khi đặt chỗ theo lịch trình cụ thể.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Được hưởng các chương trình ưu đãi như thành viên hạng Q.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1, ml: 2 }}>
                  - Có thể chuyển đổi sang hạng thẻ chính thức nếu đủ điều kiện.
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mb: 5 }} id="Hướng dẫn đặt chỗ" ref={sectionRefs["Hướng dẫn đặt chỗ"]}>
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'var(--clr-txt-1)',
                py: 1,
                pl: 2,
                borderLeft: '4px solid var(--clr-txt-2)',
                backgroundColor: 'var(--clr-bg-4)',
              }}>
                IX. HƯỚNG DẪN ĐẶT CHỖ
              </Typography>
              <List sx={{ pl: 3 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>1. Đặt Chỗ Không Cần Đăng Nhập</strong>
                  <List sx={{ pl: 3 }}>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn sự kiện mong muốn.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn combo dịch vụ phù hợp.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn vị trí ghế ngồi ưa thích.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn món ăn và đồ uống kèm theo (nếu có).</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Nhập thông tin cá nhân để hoàn tất đặt chỗ.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Tiến hành thanh toán.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Hệ thống sẽ tự động tạo tài khoản và gửi xác nhận qua email.</ListItem>
                  </List>
                </ListItem>

                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>2. Đặt Chỗ Khi Đã Có Tài Khoản</strong>
                  <List sx={{ pl: 3 }}>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Đăng nhập vào hệ thống.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn sự kiện mong muốn.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn combo dịch vụ phù hợp.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn vị trí ghế ngồi ưa thích.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn món ăn và đồ uống kèm theo (nếu có).</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Tiến hành thanh toán.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Xác nhận thông tin đặt chỗ qua email.</ListItem>
                  </List>
                </ListItem>

                <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>
                  <strong>3. Đặt Chỗ Qua Nhân Viên Hỗ Trợ</strong>
                  <List sx={{ pl: 3 }}>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Nhân viên đăng nhập bằng tài khoản nhân viên.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn sự kiện khách hàng mong muốn.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn combo dịch vụ phù hợp.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn vị trí ghế ngồi theo yêu cầu của khách.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Chọn món ăn và đồ uống kèm theo (nếu có).</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Nhập thông tin khách hàng (tên, email, số điện thoại, v.v.).</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Tiến hành thanh toán.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Hệ thống sẽ tạo tài khoản cho khách hàng và gửi xác nhận qua email.</ListItem>
                    <ListItem sx={{ display: 'list-item', listStyleType: '- ', py: 1 }}>- Nhân viên chia sẻ thông tin đặt chỗ với khách qua email hoặc tin nhắn.</ListItem>
                  </List>
                </ListItem>
              </List>
            </Box>
            <Box sx={{ mt: 6, textAlign: 'center', bgcolor: 'var(--clr-bg-4)', py: 3, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Nếu bạn có bất kỳ câu hỏi nào liên quan đến các điều khoản, vui lòng liên hệ với chúng tôi:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Email: <Link href="mailto:queen.accoustic47@gmail.com" style={{ color: 'var(--clr-txt-1)' }}>queen.accoustic47@gmail.com</Link>
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                Hotline: 1900 5225
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default TermsPage; 