import { StringUtils } from 'src/common/utils/string.utils';
import { CreateIcomeDto } from './dto/createIncom.dto';
import { IncomeRepo } from './income.repo';
import { Injectable } from "@nestjs/common";
import { UpdateUserIncome } from './dto/updateUser.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class IncomeService {
    constructor(private readonly _incomeRepo: IncomeRepo, private readonly _userService: UsersService) {}

    async createIncome(createIncomeDto: CreateIcomeDto){

        const data = {
            _id: StringUtils.generateObjectId(),
            name: createIncomeDto.name,
            desc: createIncomeDto.desc,
            type_price: createIncomeDto.type_price,
            price: createIncomeDto.price
        }
        return await this._incomeRepo.createIncome(data);
    }

    async updateStatusIncome(id, updateIncome){
        return await this._incomeRepo.updateIncome(id, updateIncome);
    }

    async getIncomeByCondition(condition){
        return await this._incomeRepo.getIncomeByCondition(condition);
    }   

    async getIncomesById(id){
        return await this._incomeRepo.findIncomeById(id);
    }

    async updateIncomeForUser(incomeId, query: UpdateUserIncome, usersIncome){
        if(usersIncome.length> 0){
            return await this._userService.updateUserIncome(usersIncome, incomeId)
        }
        const dataQuery = {
            ...(query?.role && { role: query.role }),
            ...(query?.time_create && {
              createdAt: { $lte: new Date(query.time_create) }
            }),
          };

        const users = await this._userService.findByCondition(dataQuery)
        const ids = users.map((value) => String(value._id));

        return await this._userService.updateUserIncome(ids, incomeId)
    }

    async deleteIncome(query: UpdateUserIncome, usersIncome){
        if(usersIncome.length> 0){
            return await this._userService.deleteIncome(usersIncome)
        }
        const dataQuery = {
            ...(query?.role && { role: query.role }),
            ...(query?.time_create && {
              createdAt: { $lte: new Date(query.time_create) }
            }),
          };
        const users = await this._userService.findByCondition(dataQuery)
        const ids = users.map((value) => String(value._id));

        return await this._userService.deleteIncome(ids)
    }
}

