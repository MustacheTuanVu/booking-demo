import { CreateContentEvent } from './dto/create.dto';
import { Content_eventRepo } from './content_event.repo';
import { Injectable } from "@nestjs/common";
import { ArtistsService } from 'src/artists/artists.service';
import { MessageCode } from 'src/common/exception/MessageCode';
import { StringUtils } from 'src/common/utils/string.utils';
import { ObjectId } from 'mongoose';
import { UpdateContentEvent } from './dto/update.dto';

@Injectable()
export class Content_eventService {
    constructor(private readonly _content_eventRepo: Content_eventRepo,
                // private readonly _artistsService: ArtistsService,
    ) { }

    async createManyContent_event(eventID: string, content: CreateContentEvent[]) {

        const data = content.map((value) => ({
            _id: StringUtils.generateObjectId(),
            event_id: StringUtils.ObjectId(eventID),
            artist_id: StringUtils.ObjectId(value.artist_id),
            status: value.status,
            ...(value.desc && { desc: value.desc }),
            ...(value.time && { time: value.time })
        }));

        return await this._content_eventRepo.createManyContent_event(data);
    }

    async findByArtistId(artistId){
        return await this._content_eventRepo.findByArtistId(artistId);
    }

    async updateContent_event(updateContents: UpdateContentEvent[], idEvent): Promise<any[]> {

        await this._content_eventRepo.deleteContent_eventByEvents(idEvent)

        const updatedContents = await Promise.all(
            updateContents.map(async (value) => {
                const data: any = {
                    ...(value.artist_id && { artist_id: StringUtils.ObjectId(value.artist_id) }),
                    ...(value.desc && { desc: value.desc }),
                    ...(value.time && { time: value.time }),
                    ...(value.status && { status: value.status }),
                    event_id: idEvent
                };
                const checkExist = await this._content_eventRepo.findContent_eventById(value.content_id);

                if(!checkExist){
                    data._id = StringUtils.generateObjectId();
                    return this._content_eventRepo.createContent_event(data);
                }
                
                return this._content_eventRepo.updateContent_event(value.content_id, data);
                
            })
        );
        return updatedContents;
    }

    async deleteContentEvent(idEvent){
        return await this._content_eventRepo.deleteContent_eventByEvents(idEvent);
    }
}

