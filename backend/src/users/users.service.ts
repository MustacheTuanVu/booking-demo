import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UsersRepo } from './users.repo';
import { CreateUserDto } from './dto/createUser.dto';
import { StringUtils } from 'src/common/utils/string.utils';
import { UserModel } from './model/user.model';
import { ResponseModel } from 'src/common/model/response.model';
import { MessageCode } from 'src/common/exception/MessageCode';
import { UserStatus } from './enum/status.enum';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { FILE_UPLOAD_AVATAR_USER } from 'src/common/constants/media.constants';
import { HandelFile } from 'src/common/utils/handelFile.utils';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { UserRole } from './enum/role.enum';
import { MediaService } from 'src/media/media.service';
import { TypeImage } from 'src/media/enum/type.enum';
import { UpdateCustomerType } from './dto/updateCustomerType.dto';
import { CustomerType } from './enum/type.enum';
import * as cron from 'node-cron';
import { Membership_logsService } from 'src/membership_logs/membership_logs.service';
import { Membership_pricesService } from 'src/membership_prices/membership_prices.service';
import { TypeBuy } from 'src/membership_logs/enum/type.enum';
import { UpdateGuestsDto } from './dto/guest.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserCondition } from './dto/condition.dto';
import { TypeIncome } from 'src/income/enum/type.enum';
import { ApiException } from 'src/common/exception/ApiException';

@Injectable()
export class UsersService {
    constructor(
        private readonly _usersRepo: UsersRepo,
        private readonly _mediaService: MediaService,
        private readonly _memberShipPriceService: Membership_pricesService,
        private readonly _memberShipLogService: Membership_logsService,
        @Inject(forwardRef(() => AuthService))
        private readonly _authenService: AuthService,
    ) {}

    startScheduleLogger() {
        cron.schedule('0 0 * * *', async () => {
            const currentTime = new Date();
            const formattedTime = currentTime.toTimeString().split(' ')[0]; // hh:mm:ss

            console.log(`🔥 [${formattedTime}] Kiểm tra và reset hạng thẻ...`);

            const result = await this._usersRepo.resetExpiredCustomerTypes();

            console.log(`✅ [${formattedTime}] Đã cập nhật ${result} user.`);

            // check hạng thẻ guest

            const guest = await this._usersRepo.resetExpiredCustomerGuest();

            console.log(`✅ [${formattedTime}] Đã cập nhật ${guest} guest user.`);
        });

        console.log('✅ Cron job đã khởi động!');
    }

    async findOne(username: string) {
        const dataRes = await this._usersRepo.findByPhone(username);
        return dataRes;
    }

    async createUser(createUserDto: CreateUserDto) {
        const user = await this._usersRepo.findByPhone(createUserDto.phone);
        const userEmail = await this._usersRepo.findByPhone(createUserDto.email);
        if (user) {
            throw MessageCode.USER.PHONE_IS_EXIST;
        }
        if (userEmail) {
            throw new ApiException({
                code: 'EMAIL_IS_EXIST',
                message: userEmail.phone,
                status: HttpStatus.CONFLICT,
            });
        }

        let data = {
            _id: StringUtils.generateObjectId(),
            name: createUserDto.name,
            phone: createUserDto.phone,
            ...(createUserDto.cukcuk_id && { cukcuk_id: createUserDto.cukcuk_id }),
            email: createUserDto.email,
            address: createUserDto.address,
            identity_number: createUserDto.identity_number,
            // customer_type: createUserDto.customer_type,
            role: UserRole.USER,
            point: 0,
            referral_code: RandomCodeUtils.generateUniqueCode(10),
            password: createUserDto.password,
            ...(createUserDto.status && {isDelete: createUserDto.status})
        };
        const dataRes = await this._usersRepo.createUser(data);

        const dataToken = await this._authenService.getTokenByPhone(dataRes.phone);

        return dataToken;
    }

    async updateUserByCondition(condition: any, data: any){
        const userUpdate = await this._usersRepo.updateUserByCondition(condition, data);
        if(userUpdate === null) throw MessageCode.USER.NOT_FOUND;
        const dataToken = await this._authenService.getTokenByPhone(userUpdate.phone);
        return dataToken;
    }

    async checkValidateUser(createUserDto: CreateUserDto){
        const user = await this._usersRepo.findByPhone(createUserDto.phone);
        const userEmail = await this._usersRepo.findByPhone(createUserDto.email);
        if (user) {
            throw MessageCode.USER.PHONE_IS_EXIST;
        }
        if (userEmail) {
            throw new ApiException({
                code: 'EMAIL_IS_EXIST',
                message: userEmail.phone,
                status: HttpStatus.CONFLICT,
            });
        }
    }

    async createStaff(createUserDto: any) {
        const user = await this._usersRepo.findByPhone(createUserDto.phone);
        const userEmail = await this._usersRepo.findByPhone(createUserDto.email);
        if (user) {
            throw MessageCode.USER.PHONE_IS_EXIST;
        }
        if (userEmail) {
            throw MessageCode.USER.EMAIL_IS_EXIST;
        }

        let data = {
            _id: StringUtils.generateObjectId(),
            name: createUserDto.name,
            phone: createUserDto.phone,
            ...(createUserDto.cukcuk_id && { cukcuk_id: createUserDto.cukcuk_id }),
            email: createUserDto.email,
            address: createUserDto.address,
            identity_number: createUserDto.identity_number,
            google_id: RandomCodeUtils.generateUniqueCode(12),
            // customer_type: createUserDto.customer_type,
            role: createUserDto.role,
            point: 0,
            referral_code: RandomCodeUtils.generateUniqueCode(10),
            password: createUserDto.password,
        };
        const dataRes = await this._usersRepo.createUser(data);
        const userModel = new UserModel(dataRes);
        return userModel;
    }

    async updateUser(phone: string, data: UpdateUserDto, file: any) {
        const user = await this._usersRepo.findByPhone(phone);
        if (!user) {
            throw new Error('User not found');
        }

        const dataUpdate = {
            ...(data.name && { name: data.name }),
            ...(data.address && { name: data.address }),
            // ...(data.email && { name: data.email }),
            ...(data.identity_number && { identity_number: data.identity_number }),
            ...(data.incom_id && { incom_id: StringUtils.ObjectId(data.incom_id) }),
            ...(data.google_id && { google_id: data.google_id }),
        };

        const res = await this._usersRepo.updateUser(user._id, dataUpdate);
        if (!res) throw MessageCode.REQUEST.BAD_REQUEST;

        if (file) {
            await this._mediaService.uploadImage(
                file,
                TypeImage.AVATAR,
                String(user._id),
                FILE_UPLOAD_AVATAR_USER,
                user._id,
            );
            const dataUpdate = await this._usersRepo.updateUser(user._id, {
                avatar: `${FILE_UPLOAD_AVATAR_USER}/${user.phone}.png`,
            });
            res.avatar = dataUpdate.avatar;
        }
        return new UserModel(res);
    }

    // nhập số điểm
    async updatePointUser(uid, point: number) {
        return await this._usersRepo.updatePointUser(uid, point);
    }

    async getUserReferred(referred) {
        return await this._usersRepo.getUserReferred(referred);
    }

    async coutPointForUserReferred(referred, totalPrice) {
        const user = await this.getUserReferred(referred);
        if (!user) throw MessageCode.USER.NOT_FOUND;
        const income: any = user?.incom_id;
        let poin = 0;
        if (income) {
            switch (income.type_price) {
                case TypeIncome.ORDER:
                    poin += Math.floor(income.price / 1000);
                    break;

                case TypeIncome.PERCENT:
                    poin += Math.floor(((income.price / 100) * totalPrice) / 1000);
                    break;

                default:
                    break;
            }
        } else {
            // không có trong chính sách không cộng j cả
            // poin += Math.floor(totalPrice / 1000);
        }
        const res = await this.updatePointUser(user._id, poin);
        return { point: poin, res };
    }

    async findById(id) {
        return await this._usersRepo.findById(id);
    }

    async findInfoByPhone(phone) {
        const data = await this._usersRepo.findInfoByPhone(phone);
        console.log(phone, data);
        if (data.length <= 0) throw MessageCode.USER.NOT_FOUND;
        return data[0];
    }

    async getUsersByCondition(condition: UserCondition) {
        return await this._usersRepo.getUsersByCondition(condition);
    }

    async findByCondition(condition) {
        return await this._usersRepo.findByCondition(condition);
    }

    async getStaffByCondition(condition: PaginationDto) {
        return await this._usersRepo.getStaffByCondition(condition);
    }

    async findByPhone(phone: string): Promise<any> {
        const data = await this._usersRepo.findByPhone(phone);
        return new UserModel(data);
    }

    async channgeStatusUser(uid, status) {
        const user = await this._usersRepo.findById(uid);
        if (!user) {
            throw MessageCode.USER.NOT_FOUND;
        }

        console.log(user);

        const data = {
            isDelete: status,
        };

        const res = await this._usersRepo.updateUser(user._id, data);
        const userModel = new UserModel(res);
        return new ResponseModel<UserModel>(userModel);
    }

    async updateIdSocketForUser(phone, idSocket) {
        return await this._usersRepo.updateIdSocketForUser(phone, idSocket);
    }

    async deleteIdSocketForUser(phone, idSocket) {
        return await this._usersRepo.deleteIdSocketForUser(phone, idSocket);
    }

    // Hàm tìm người dùng theo google_id (cho Google OAuth)
    async findByGoogleId(googleId: string): Promise<UserModel | null> {
        const data = await this._usersRepo.findByGoogleId(googleId);
        return data ? new UserModel(data) : null;
    }

    // Hàm tạo người dùng mới dựa trên thông tin từ Google
    async createGoogleUser(googleData: {
        google_id: string;
        name: string;
        email: string;
        avatar: string;
    }): Promise<UserModel> {
        // Bạn có thể đặt phone là email hoặc để trống nếu không cần thiết
        const newUser = {
            _id: StringUtils.generateObjectId(),
            google_id: googleData.google_id,
            name: googleData.name,
            email: googleData.email,
            avatar: googleData.avatar,
            role: UserRole.USER,
            referral_code: RandomCodeUtils.generateUniqueCode(10),
            // Các trường khác có thể để mặc định hoặc null
        };
        const createdUser = await this._usersRepo.createUser(newUser);
        return new UserModel(createdUser);
    }

    async verifyAcccount(body: UpdateUserDto, userId) {
        const user = await this._usersRepo.findById(userId);

        const dataUpdate: any = {};

        if(body.phone){
            const checkUserPhone = await this._usersRepo.findByPhone(body.phone);
            if(checkUserPhone) throw MessageCode.USER.PHONE_IS_EXIST;
            dataUpdate.phone = body.phone
        }

        if(body.name){
            dataUpdate.name = body.name
        }

        if(body.password){
            dataUpdate.password = body.password
        }

        if (!user) {
            throw new Error('User not found');
        }
        const res = await this._usersRepo.updateUser(userId, {
            ...dataUpdate,
            isDelete: UserStatus.ACTIVE,
        });
        if (!res) throw MessageCode.REQUEST.BAD_REQUEST;

        return new UserModel(res);
    }

    async updateCustomerType(data: UpdateCustomerType) {
        const user = await this._usersRepo.findById(data.uid);
        const now = new Date();

        const memberPrice = await this._memberShipPriceService.findById(data.priceMemberShipId);

        if (!memberPrice) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        let time = new Date();

        if (!user.customer_type_expiry || new Date(user.customer_type_expiry) < now) {
            // Nếu hạn cũ đã hết hoặc chưa có -> Lấy từ hiện tại
            time = new Date();
        } else {
            // nếu còn hạn và cập nhật khác hạng thẻ
            // if (user.customer_type !== memberPrice.type) {
            //     throw MessageCode.USER.MEMBERSHIP_NOT_EXPIRED;
            // }
            // Nếu hạn cũ còn hiệu lực -> Cộng dồn
            // Cộng thời gian dựa vào kỳ hạn (tháng hoặc năm)
            

            // // Cộng số tháng vào thời gian được chọn
            // time.setMonth(time.getMonth() + data.time);
        }

        if (memberPrice.duration === 'year') {
            // Nếu là năm, thêm số năm vào
            time.setFullYear(time.getFullYear() + data.time);
        } else {
            // Mặc định là tháng
            time.setMonth(time.getMonth() + data.time);
        }

        // Cập nhật hạng thẻ và hạn dùng mới

        const dataUpdate = {
            customer_type: memberPrice.type,
            customer_type_expiry: time,
        };

        const price = memberPrice.priceInMonth * data.time;

        const dataLog = {
            uid: data.uid,
            type: TypeBuy.MEMBERSHIP,
            price: price,
        };

        return Promise.all([
            await this._usersRepo.updateUser(data.uid, dataUpdate),
            await this._memberShipLogService.createLog(dataLog),
        ]);
    }

    async findOneByGmailOrPhone(phone, email) {
        const dataRes = await this._usersRepo.findOneByGmailOrPhone(phone, email);
        return dataRes;
    }

    async updateUserInfo(uid: any, updateUserDto) {

        if(updateUserDto.phone || updateUserDto.email) throw MessageCode.REQUEST.BAD_REQUEST

        const res = await this._usersRepo.updateUser(uid, updateUserDto);
        const userModel = new UserModel(res);
        return new ResponseModel<UserModel>(userModel);
    }

    async updateUserIncome(uids, icomeId) {
        return await this._usersRepo.updateMany(uids, { incom_id: StringUtils.ObjectId(icomeId) });
    }

    async deleteIncome(uids) {
        return await this._usersRepo.updateMany(uids, { incom_id: null });
    }

    async updateGuestUser(guests: UpdateGuestsDto | any) {
        console.log(guests.guests);
        return await Promise.allSettled(
            guests.guests.map(async (item) => {
                const guest = {
                    guest: {
                        is_guest: item.is_guest,
                        expiry: item.expiry,
                    },
                };
                this._usersRepo.updateByPhone(item.phone, guest);
            }),
        );
    }

    async deleteGuestUser(uid) {
        return await this._usersRepo.updateUser(uid, { guest: null });
    }

    async test() {
        return await this._usersRepo.resetExpiredCustomerGuest();
    }

    async getRevenueReportForStaffOrCustomer(query) {
        return await this._usersRepo.getRevenueReportForStaffOrCustomer(query);
    }

    async removeUserGuest(user) {
        if (!user || !user.guest || !user.guest.hasOwnProperty('is_guest') || !user.guest.expiry) {
            return false;
        }

        // Kiểm tra điều kiện 1: phải là guest (is_guest = true)
        const isGuest = user.guest.is_guest;

        // Kiểm tra điều kiện 2: thời hạn chưa hết
        const expiryDate = new Date(user.guest.expiry.$date);
        const currentDate = new Date();
        const isNotExpired = expiryDate > currentDate;

        if (isGuest && isNotExpired) {
            user.guest = {
                ...user.guest,
                is_guest: false,
            };

            await this._usersRepo.updateUser(user._id, {
                guest: {
                    is_guest: false,
                    expiry: null,
                },
            });
        }
    }

    async findByReferralCode(referralCode: string) {
        return await this._usersRepo.findOneByCondition({
            referral_code: referralCode,
            isDelete: UserStatus.ACTIVE
        });
    }
}
