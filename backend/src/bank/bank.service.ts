import { BankRepo } from './bank.repo';
import { Injectable } from "@nestjs/common";
import { CreateBankDto } from './dto/create.dto';
import { UsersService } from 'src/users/users.service';
import { StringUtils } from 'src/common/utils/string.utils';
import { MessageCode } from 'src/common/exception/MessageCode';

@Injectable()
export class BankService {
    constructor(private readonly _bankRepo: BankRepo, 
                private readonly _userService: UsersService
    ) {}

    async createBank(username, createDto: CreateBankDto){
        const user = await this._userService.findByPhone(username);

        if(!user) throw MessageCode.USER.NOT_FOUND;

        const bank = await this._bankRepo.findOneBankByCondition({uid: user._id});
        
        if(bank) throw MessageCode.REQUEST.BAD_REQUEST;

        const data = {
            _id: StringUtils.generateObjectId(),
            uid: user._id,
            bankCode: createDto.bankCode,
            bankName: createDto.bankName,
            accountNumber: createDto.accountNumber,
            accountHolderName: createDto.accountHolderName
        }

        return await this._bankRepo.createBank(data);
    }

    async updateBank(username, id, updateBank,){
        const user = await this._userService.findByPhone(username);

        if(!user) throw MessageCode.USER.NOT_FOUND;

        return await this._bankRepo.updateBankByCondition(
            {_id: StringUtils.ObjectId(id), uid: user._id},
            updateBank
        )
    }

    async deleteBank(id){
        return await this._bankRepo.deleteBank(id);
    }

    async getOneBankUser(uid) {
        return await this._bankRepo.findOneBankByCondition({uid: uid});
    }
}

