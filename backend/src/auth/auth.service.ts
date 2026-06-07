import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessageCode } from 'src/common/exception/MessageCode';
import { ResponseModel } from 'src/common/model/response.model';
import { UserModel } from 'src/users/model/user.model';
import { UsersService } from 'src/users/users.service';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
    constructor(@Inject(forwardRef(() => UsersService)) private readonly _userService: UsersService, 
        private readonly  _jwtService: JwtService,
        private readonly _mailerService: MailerService) {
    }

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this._userService.findOne(username);
        if (user?.password !== pass) {
            throw MessageCode.USER.PASSWORD_WRONG;
        }

        const payload = { sub: user._id, username: user.google_id, phone: user.phone };
        const token = await this._jwtService.signAsync(payload);

        const dataRes = {
            token: token,
            infoUser : new UserModel(user)
        }

        return dataRes;
    }

    async getTokenByPhone(phone: string): Promise<any> {
        const user = await this._userService.findByPhone(phone)
        const payload = { sub: user._id, username: user.google_id, phone: user.phone };
        const token = await this._jwtService.signAsync(payload);

        const dataRes = {
            token: token,
            infoUser : new UserModel(user)
        }

        return dataRes;
    }

    async findByPhone(username): Promise<any>{
        const infoUser = await this._userService.findOne(username);
        if(!infoUser){
            throw MessageCode.USER.NOT_FOUND;
        }
        const userRes = new UserModel(infoUser);
        return userRes;
    }

    // Hàm mới cho Google OAuth
    async validateGoogleUser(profile: any): Promise<any> {
        // Giả sử UsersService có phương thức tìm kiếm theo google_id
        let user = null;
        if (profile?.emails && profile.emails[0] && profile.emails[0].value) {
            user = await this._userService.findByGoogleId(profile.emails[0].value);
        } else {
            user = await this._userService.findByGoogleId(profile.id);
        }
        
        if (!user) {
            // Nếu chưa có, tạo người dùng mới
            user = await this._userService.createGoogleUser({
                google_id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
            });
        } else {
            if (user.phone) {
                user = await this._userService.updateUser(user.phone, {...user, google_id: profile.id}, null)
            }
        }
        return user;
    }

    
    async generateJWT(googleUser: any, googleId): Promise<any> {
        // Tạo token với payload chứa id và email hoặc các thông tin cần thiết
        const user = await this._userService.findOne(googleId);

        // console.log('user', user, googleUser)
        if(!user) throw MessageCode.USER.NOT_FOUND

        
        const payload = { sub: googleUser._id, username: googleId, phone: user.phone };
        const token = await this._jwtService.signAsync(payload);

        const dataRes = {
            token: token,
            infoUser : new UserModel(googleUser)
        }

        return dataRes.token;
    }

    async findByGoogle(google_id): Promise<any>{
        const infoUser = await this._userService.findOne(google_id);
        if(!infoUser){
            throw MessageCode.USER.NOT_FOUND;
        }
        const userRes = new UserModel(infoUser);
        return userRes;
    }

    async findById(id): Promise<any>{
        const infoUser = await this._userService.findById(id);
        if(!infoUser){
            throw MessageCode.USER.NOT_FOUND;
        }
        const userRes = new UserModel(infoUser);
        return userRes;
    }

    async forgotPassword(email){
        const user: UserModel = await this.findByPhone(email);
        const newPass = RandomCodeUtils.generateUniqueCode(8);
        if(!user) throw MessageCode.USER.NOT_FOUND;

        const dataUpdate = {
            password: newPass
        }
        const userChange = await this._userService.updateUserInfo(user._id, dataUpdate);

        if(userChange) {
            return await this._mailerService.sendEmailNewPassword(user.email, user, newPass)
        }
    }

    async changePassword(phone, newPass){
        const user: UserModel = await this.findByPhone(phone);

        if(!user) throw MessageCode.USER.NOT_FOUND;

        const dataUpdate = {
            password: newPass
        }
        const userUpdate = await this._userService.updateUserInfo(user._id, dataUpdate);

        return userUpdate;
    }
}
