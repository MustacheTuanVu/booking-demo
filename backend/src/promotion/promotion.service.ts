import { StringUtils } from 'src/common/utils/string.utils';
import { CreatePromotion } from './dto/create.dto';
import { PromotionRepo } from './promotion.repo';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { MessageCode } from 'src/common/exception/MessageCode';
import { Status } from 'src/common/enum/status.enum';
import { UsersService } from 'src/users/users.service';
import { PromotionStatus, PromotionForType } from './enum/status.enum';
import { ApiException } from 'src/common/exception/ApiException';
import { GetPromotionByCondition } from './dto/condition.dto';
import { GetPromotionByAdmin } from './dto/condition.admin.dto';
import { Promotion, PurchaseHistoryItem } from './schema/promotion.schema';

@Injectable()
export class PromotionService {
    constructor(
        private readonly _promotionRepo: PromotionRepo,
        private readonly _userService: UsersService,
    ) {}

    private generatePromotionCode(promotion: any, ctv?: any, purchaseId?: string): string {
        let code = promotion.code;
        if (promotion.for_type === PromotionForType.CTV && ctv && purchaseId) {
            code = `${promotion.code}-${ctv.referral_code}-${purchaseId}`;
        }
        return code;
    }

    private parsePromotionCode(code: string): { 
        promotionCode: string, 
        referralCode?: string,
        purchaseId?: string 
    } {
        const parts = code.split('-');
        if (parts.length === 3) {
            return {
                promotionCode: parts[0],
                referralCode: parts[1],
                purchaseId: parts[2]
            };
        }
        return { promotionCode: code };
    }

    async createPromotion(createPromo: CreatePromotion) {
        let newCode;
        // check code
        if (createPromo.code) {
            newCode = createPromo.code;
            const checkCode = await this._promotionRepo.findOnePromotionByCondition({
                code: createPromo.code,
            });
            if (checkCode)
                throw new ApiException({
                    code: 'PROMOTION_CODE_EXIST',
                    message: `Code đã tồn tại: ${createPromo.code}`,
                    status: HttpStatus.BAD_REQUEST,
                });
        } else {
            let isDuplicate = true;
            while (isDuplicate) {
                newCode = RandomCodeUtils.generateUniqueCode(15);

                const checkCode = await this._promotionRepo.findOnePromotionByCondition({
                    code: newCode,
                });

                if (!checkCode) {
                    isDuplicate = false;
                }
            }
        }
        //

        const data = {
            _id: StringUtils.generateObjectId(),
            ...(createPromo.uid && { uid: createPromo.uid }),
            ...(createPromo.code ? { code: createPromo.code } : { code: newCode }),
            name: createPromo.name,
            ...(createPromo.desc && { desc: createPromo.desc }),
            expired: createPromo.expired,
            status: createPromo.status,
            type_price: createPromo.type_price,
            price: createPromo.price,
            required_points: createPromo.required_points,
            total: createPromo.max_quantity,
            max_quantity: createPromo.max_quantity,
            for: createPromo.for,
            for_type: createPromo.for_type,
            ...(createPromo.user_list && { user_list: createPromo.user_list }),
            ...(createPromo.for_type === 'Hạng thẻ' ? { for: createPromo.for } : {})
        };

        return await this._promotionRepo.createPromotion(data);
    }    
    
    async getPromotionByCode(code: string) {
        try {
            console.log(`promotion vô:  ${code}`);
            // Parse promotion code to handle CTV format
            const { promotionCode, referralCode, purchaseId } = this.parsePromotionCode(code);

            // Get base promotion by original code
            const promotion = await this._promotionRepo.findOnePromotionByCondition({
                code: promotionCode,
                status: Status.ACTIVE,
                expired: { $gt: new Date() },
            });

            console.log(`promotion:  ${promotion}`);

            if (!promotion) {
                throw MessageCode.PROMOTION.PROMOTION_NOT_FOUND;
            }

            // Handle regular promotions
            if (promotion.for_type !== PromotionForType.CTV) {
                if (promotion.max_quantity <= 0) {
                    throw MessageCode.PROMOTION.PROMOTION_USED_UP;
                }
                return promotion;
            }

            // Handle CTV promotions - must have referralCode and purchaseId
            if (!referralCode || !purchaseId) {
                throw new ApiException({
                    code: 'INVALID_PROMOTION_CODE',
                    message: 'Mã promotion không hợp lệ 1',
                    status: HttpStatus.BAD_REQUEST,
                });
            }

            // Find referrer by referral code
            const referrer = await this._userService.findByReferralCode(referralCode);
            
            console.log(`Checking CTV promotion with code: ${referralCode}, purchaseId: ${referrer}`);
            if (!referrer) {
                throw new ApiException({
                    code: 'INVALID_PROMOTION_CODE',
                    message: 'Mã promotion không hợp lệ 2',
                    status: HttpStatus.BAD_REQUEST,
                });
            }            // Verify the purchase exists and is still valid
            const purchaseIndex = promotion.purchase_history.findIndex(p => {
                const isValidCtv = p.ctv_id.toString() === referrer._id.toString();
                const isValidCode = p.code === code;
                const isNotUsed = !p.used_by || !p.used_by.user_id;
                const isActive = p.status === PromotionStatus.ACTIVE;
                return isValidCtv && isValidCode && isNotUsed && isActive;
            });            if (promotion.purchase_history.length > 0) {
                const p = promotion.purchase_history[0];
                console.log('Debugging first purchase history item:');
                console.log('CTV match:', p.ctv_id.toString() === referrer._id.toString(), 
                    { purchaseCtv: p.ctv_id.toString(), referrerId: referrer._id.toString() });
                console.log('Code match:', p.code === code,
                    { purchaseCode: p.code, providedCode: code });
                console.log('Not used check:', !p.used_by || !p.used_by.user_id,
                    { usedBy: p.used_by });
                console.log('Status check:', p.status === PromotionStatus.ACTIVE,
                    { status: p.status, expected: PromotionStatus.ACTIVE });
            }

            if (purchaseIndex === -1) {
                throw MessageCode.PROMOTION.PROMOTION_USED_UP;
            }

            return promotion;
        } catch (error) {
            console.log(`Error getting promotion by code: ${error.message}`);
            throw new ApiException({
                code: 'PROMOTION_CODE_NOT_FOUND',
                message: `Promotion code not found: ${code}`,
                status: HttpStatus.NOT_FOUND,
            });
            
        }
    }

    async changeStatus(id, status: Status.ACTIVE | Status.INACTIVE) {
        return await this._promotionRepo.updatePromotion(id, { status: status });
    }

    async getPromotionById(id) {
        return await this._promotionRepo.findPromotionById(id);
    }

    async getPromotionByCondition(condition, username?: string) {
        if (username) {
            const user = await this._userService.findByPhone(username);
            if (!user) {
                throw MessageCode.USER.NOT_FOUND;
            }
            return await this._promotionRepo.getPromotionByCondition(condition, user._id);
        }
        return await this._promotionRepo.getPromotionByCondition(condition, false);
    }

    async getPromotionByAdmin(
        condition: GetPromotionByAdmin,
    ) {
        return await this._promotionRepo.getPromotionByAdmin(condition);
    }

    async updatePromotion(id, updatePromo) {
        return await this._promotionRepo.updatePromotion(id, updatePromo);
    }

    async effectPromotion(id, type: 'ADD' | 'MINUS') {
        const data = await this._promotionRepo.effectPromotion(id, type);
        console.log(`Update promotion`, type);
        return data;
    }

    async buyPromotion(username: string, promotionId: string): Promise<Partial<Promotion & { code: string }>> {
        const user = await this._userService.findByPhone(username);
        const promotion = await this._promotionRepo.findPromotionById(promotionId);

        if (!user.point) {
            throw MessageCode.POINT.POINTS_NOT_FOUND;
        }

        if (user.point < promotion.required_points) {
            throw MessageCode.POINT.POINTS_NOT_ENOUGH;
        }

        if (promotion.for_type !== PromotionForType.CTV) {
            throw new ApiException({
                code: 'INVALID_PROMOTION_TYPE',
                message: 'Promotion này không dành cho CTV',
                status: HttpStatus.BAD_REQUEST,
            });
        }

        if (promotion.status !== Status.ACTIVE) {
            throw MessageCode.PROMOTION.PROMOTION_NOT_FOUND;
        }

        if (promotion.expired && new Date() > new Date(promotion.expired)) {
            throw MessageCode.PROMOTION.PROMOTION_EXPIRED;
        }

        // Generate purchase ID padded with zeros
        const purchaseId = String(promotion.purchase_history.length + 1).padStart(3, '0');
          // Generate promotion code
        console.log(`Generating promotion code`, promotion, user, purchaseId);
        const generatedCode = this.generatePromotionCode(promotion, user, purchaseId);
        console.log(`Generated promotion code: ${generatedCode}`);

        // Create new purchase history entry
        const purchaseData = {
            ctv_id: user._id,
            purchase_date: new Date(),
            status: PromotionStatus.ACTIVE,
            code: generatedCode
        };

        // Update promotion and user points atomically
        await Promise.all([
            this._promotionRepo.updatePromotion(promotion._id, {
                $push: { purchase_history: purchaseData }
            }),
            this._promotionRepo.updatePromotion(promotion._id, {
                $push: { purchased_by: user._id }
            }),
            this._userService.updatePointUser(user._id, -promotion.required_points)
        ]);

        // Return promotion with generated code
        return {
            ...promotion,
            code: this.generatePromotionCode(promotion, user, purchaseId)
        };
    }

    async usePromotion(code: string, userId: string): Promise<Partial<Promotion & { used_by: string; used_at: Date }>> {
        const { promotionCode, referralCode, purchaseId } = this.parsePromotionCode(code);
        const promotion = await this._promotionRepo.findOnePromotionByCondition({
            code: promotionCode,
            status: Status.ACTIVE,
            expired: { $gt: new Date() }
        });

        if (!promotion) {
            throw MessageCode.PROMOTION.PROMOTION_NOT_FOUND;
        }

        // Xử lý cho promotion thông thường
        if (promotion.for_type !== PromotionForType.CTV) {
            if (promotion.max_quantity <= 0) {
                throw MessageCode.PROMOTION.PROMOTION_USED_UP;
            }
            await this._promotionRepo.effectPromotion(promotion._id, 'MINUS');
            return promotion;
        }

        // Xử lý cho promotion CTV
        if (!referralCode || !purchaseId) {
            throw new ApiException({
                code: 'INVALID_PROMOTION_CODE',
                message: 'Mã promotion không hợp lệ',
                status: HttpStatus.BAD_REQUEST,
            });
        }

        const referrer = await this._userService.findByReferralCode(referralCode);
        if (!referrer) {
            throw new ApiException({
                code: 'INVALID_PROMOTION_CODE',
                message: 'Mã promotion không hợp lệ',
                status: HttpStatus.BAD_REQUEST,
            });
        }

        const purchaseIndex = promotion.purchase_history.findIndex(p => {
            const isValidCtv = p.ctv_id.toString() === referrer._id.toString();
            const isValidCode = p.code === code;
            const isNotUsed = !p.used_by || !p.used_by.user_id;
            const isActive = p.status === PromotionStatus.ACTIVE;
            return isValidCtv && isValidCode && isNotUsed && isActive;
        });            if (promotion.purchase_history.length > 0) {
            const p = promotion.purchase_history[0];
            console.log('Debugging first purchase history item:');
            console.log('CTV match:', p.ctv_id.toString() === referrer._id.toString(), 
                { purchaseCtv: p.ctv_id.toString(), referrerId: referrer._id.toString() });
            console.log('Code match:', p.code === code,
                { purchaseCode: p.code, providedCode: code });
            console.log('Not used check:', !p.used_by || !p.used_by.user_id,
                { usedBy: p.used_by });
            console.log('Status check:', p.status === PromotionStatus.ACTIVE,
                { status: p.status, expected: PromotionStatus.ACTIVE });
        }

        if (purchaseIndex === -1) {
            throw new ApiException({
                code: 'PROMOTION_NOT_AVAILABLE',
                message: 'Promotion này không còn khả dụng',
                status: HttpStatus.BAD_REQUEST,
            });
        }

        const updateData = {
            [`purchase_history.${purchaseIndex}.used_by`]: {
                user_id: userId,
                used_at: new Date()
            },
            [`purchase_history.${purchaseIndex}.status`]: PromotionStatus.USED
        };

        await this._promotionRepo.updatePromotion(promotion._id, updateData);
        return promotion;
    }

    async deletePromotion(id) {
        return await this._promotionRepo.deletePromotion(id);
    }

    async getMyPromotions(username: string, condition: GetPromotionByCondition): Promise<{
        promotion: Promotion[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const user = await this._userService.findByPhone(username);
        if (!user) {
            throw MessageCode.USER.NOT_FOUND;
        }
        return await this._promotionRepo.getPromotionsByPurchasedBy(user._id, condition);
    }

    async recoverVoucher(promotionId: any) {
        try {
            await this.effectPromotion(String(promotionId), 'ADD');
        } catch (error) {
            
        }
    }

    // set used_by trong purchase_history của promotion là {} và set status là 'ACTIVE'
    async resetPromotionUsage(promotionId: string, uid: string) {
        const promotion = await this._promotionRepo.findPromotionById(promotionId);

        if (!promotion) {
            console.log(`Promotion not found: ${promotionId}`);
            return;
        }

        if (!promotion.purchase_history) {
            return;
        }

        for (let i = 0; i < promotion.purchase_history.length; i++) {
            const p = promotion.purchase_history[i];

            console.log(`--- element:`, p.ctv_id.toString(), uid, p.ctv_id.toString() == uid);
            
        }
        
        // get ra purchase_history từ promotion mà có uid là người dùng hiện tại
        const purchaseHistory = promotion.purchase_history.filter(p => p.ctv_id.toString() == uid);
        
        // reset used_by và status cho các purchase_history này
        const updateData = purchaseHistory.reduce((acc, p, index) => {
            acc[`purchase_history.${index}.used_by`] = {};
            acc[`purchase_history.${index}.status`] = PromotionStatus.ACTIVE;
            return acc;
        }, {});

        if (Object.keys(updateData).length > 0) {
            await this._promotionRepo.updatePromotion(promotionId, updateData);
            return { message: 'Đã reset thành công' };
        } else {
            console.log(`---- promotion: ${promotion}`);
            console.log(`---- purchase_history: ${purchaseHistory}`);
            console.log(`--- promotionId: ${promotionId}`);
            console.log(`--- uid: ${uid}`);
            console.log(`--- updateData: ${JSON.stringify(updateData)}`);
        }

    }
}
