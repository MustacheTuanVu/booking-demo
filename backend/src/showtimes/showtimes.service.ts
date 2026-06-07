import { CreateShowTimes } from './dto/create.dto';
import { ShowtimesRepo } from './showtimes.repo';
import { Injectable } from "@nestjs/common";
import { StringUtils } from 'src/common/utils/string.utils';
import { UpdateShowTimes } from './dto/update.dto';

@Injectable()
export class ShowtimesService {
    constructor(private readonly _showtimesRepo: ShowtimesRepo, ) {}

    async createManyShowtimes(eventId: string, createShowTimes: CreateShowTimes[]): Promise<any> {
        const data = createShowTimes.map((value) => ({
            _id: StringUtils.generateObjectId(),
            event_id: StringUtils.ObjectId(eventId),
            time_start: value.time_start,
            time_end: value.time_end,
        }));
        return this._showtimesRepo.createManyShowtimes(data);
    }

    async updateShowtimes(updateShowTimes: UpdateShowTimes[]): Promise<any[]> {
        const updatedShowtimes = await Promise.all(
            updateShowTimes.map(async (value) => {
                const data = {
                    ...(value.time_start && { time_start: value.time_start }),
                    ...(value.time_end && { time_end: value.time_end }),
                };
                return this._showtimesRepo.updateShowtimes(value.showtimeId, data);
            })
        );
        return updatedShowtimes;
    }

    async getById(id){
        return await this._showtimesRepo.findShowtimesById(id);
    }

    async deleteShowtimes(idEvent){
        return await this._showtimesRepo.deleteShowtimesByEvent(idEvent);
    }
}

