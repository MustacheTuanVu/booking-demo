import { StringUtils } from 'src/common/utils/string.utils';
import { CreateSeatMapDto } from './dto/create.dto';
import { Seat_mapRepo } from './seat_map.repo';
import { Injectable } from "@nestjs/common";
import { UpdateSeatMapDto } from './dto/update.dto';

@Injectable()
export class Seat_mapService {
    constructor(private readonly _seat_mapRepo: Seat_mapRepo, ) {}

    async getSeatMapByCondition(condition){
        return await this._seat_mapRepo.getSeatMapByCondition(condition);
    }

    async getSeatMapById(id: string){
        return await this._seat_mapRepo.findSeat_mapById(id);
    }

    async createSeatMap(createSeatMapDto: CreateSeatMapDto){
        createSeatMapDto['_id'] = StringUtils.generateObjectId();
        return await this._seat_mapRepo.createSeat_map(createSeatMapDto);
    }

    async updateSeatMap(id, updateSeatMapDto: UpdateSeatMapDto){
        return await this._seat_mapRepo.updateSeat_map(id, updateSeatMapDto)
    }
}

