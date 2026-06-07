
import { Membership_logsRepo } from './membership_logs.repo';
import { Injectable } from "@nestjs/common";
import { StringUtils } from 'src/common/utils/string.utils';
import { CreateBuy } from './dto/create.dto';
import { GetAnalytics } from 'src/analytics/dto/getByCondition.dto';

@Injectable()
export class Membership_logsService {
    constructor(private readonly _membership_logsRepo: Membership_logsRepo) { }

    async createLog(data: CreateBuy) {
        const dataCreate = {
            _id: StringUtils.generateObjectId(),
            uid: StringUtils.ObjectId(data.uid),
            type: data.type,
            price: data.price
        }

        return await this._membership_logsRepo.createMembership_logs(dataCreate);
    }

    async getMembershipRevenueByPeriod(start: Date, end: Date): Promise<number> {
        return await this._membership_logsRepo.getMembershipRevenueByPeriod(start, end);
    }

    async getMembershipLogListForAnalytics(start: Date, end: Date): Promise<any[]> {
        return await this._membership_logsRepo.getMembershipLogListForAnalytics(start, end);
    }

    // Get danh sách log theo user id và type là "MEMBERSHIP"
    async getMembershipLogsByUserId(uid: string): Promise<any[]> {
        return await this._membership_logsRepo.findMembership_logsByCondition({ uid: StringUtils.ObjectId(uid), type: 'MEMBERSHIP' });
    }

}

