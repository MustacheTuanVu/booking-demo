import { StringUtils } from 'src/common/utils/string.utils';
import { CreatecPriceMembership } from './dto/create.dto';
import { UpdatePriceMembership } from './dto/update.dto';
import { Membership_pricesRepo } from './membership_prices.repo';
import { Injectable } from "@nestjs/common";

@Injectable()
export class Membership_pricesService {
    constructor(private readonly _membership_pricesRepo: Membership_pricesRepo, ) {}

    async get() {
        return await this._membership_pricesRepo.getMembership_prices({});
    }

    async findById(id){
        return await this._membership_pricesRepo.findMembership_pricesById(id);
    }

    async findByType(type){
        return await this._membership_pricesRepo.findOneMembership_pricesByCondition({type});
    }

    async create(data: CreatecPriceMembership) {
        const dataCreate = {
            _id: StringUtils.generateObjectId(),
            type: data.type,
            priceInMonth: data.priceInMonth
        }

        return await this._membership_pricesRepo.createMembership_prices(dataCreate);
    }

    async update(id: string, data: UpdatePriceMembership) {
        return await this._membership_pricesRepo.updateMembership_prices(id, data);
    }

    async delete(id: string) {
        return await this._membership_pricesRepo.deleteMembership_prices(id);
    }
}

