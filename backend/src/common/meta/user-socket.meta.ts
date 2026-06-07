import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { MessageCode } from "../exception/MessageCode";
import { jwtConstants } from "src/auth/constants";
import { verify } from "jsonwebtoken";

export const UserSocket = createParamDecorator(
    async (data: string, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const token = request['handshake']?.headers?.authorization;
      if (!token) {
        return null; // or throw an error if you prefer
      }
  
      try {
        // Thực hiện giải mã JWT để lấy thông tin người dùng
        const decodedToken: any = verify(token, jwtConstants.secret); // Thay thế 'your_jwt_secret' bằng khóa bí mật của bạn
  
        // Trả về username hoặc bất kỳ thông tin người dùng nào bạn muốn
        return decodedToken.username;
      } catch (error) {
        // Xử lý lỗi khi giải mã thất bại
        console.error(error);
        return null; // or throw an error if you prefer
      }
    }
  );
