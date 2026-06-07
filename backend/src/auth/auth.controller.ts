import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/meta/public.meta';
import { Control } from 'src/common/meta/control.meta';
import { SignInDto } from './dto/signin.dto';
import { Description } from 'src/common/meta/description.meta';
import { User } from 'src/common/meta/user.meta';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from 'src/users/enum/role.enum';
import { ForgotPassDto } from './dto/forgot.dto';

@Control('auth')
export class AuthController {
    private _authService: AuthService;
    constructor(authService: AuthService) {
        this._authService = authService;
    }

    // Muốn bảo mật tự mà chế 
    @Public()
    @Post('login')
    @Description('Đăng Nhập' , [{status: 200, description: 'create successfully'}])
    async signIn(@Body() signInDto: SignInDto){
        return await this._authService.signIn(signInDto.phone, signInDto.password);
    }

    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BOSS)
    @Get('getUserByJWT')
    @Description('lây thông tin user từ token', [{status: 200, description: 'get successfully'}])
    async getUserByJWT(@Req() req: any){
        return await this._authService.findById(req.user.sub);
    }

    // Endpoint khởi tạo Google OAuth
    @Public()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {
        // Endpoint này sẽ chuyển hướng người dùng đến trang đăng nhập của Google
    }

    // Callback từ Google OAuth
    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req: any, @Res() res: any) {
        // Sau khi đăng nhập thành công, req.user sẽ chứa token
        const token = req.user ? (req.user as any).token : null;
        return res.redirect(`${process.env.FE_URI}/login-success?token=${token}`);
    }

    @Public()
    @Post('forgotPassword')
    @Description('Quên mật khẩu', [{status: 200, description: 'update successfully'}])
    async forgotPassword(@Query('email') email: string){
        return await this._authService.forgotPassword(email);
    }

    @Public()
    @Post('changePassword')
    @Description('Đổi mật khẩu', [{status: 200, description: 'update successfully'}])
    async changePassword(@User() usernname, @Query('newPass') newPass: string){
        return await this._authService.changePassword(usernname, newPass);
    }
}
