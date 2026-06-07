import { StringUtils } from 'src/common/utils/string.utils';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { EventDocument } from './schema/events.schema';
import { InjectModel } from '@nestjs/mongoose';
import { GetEventByCondition } from './dto/getByCondition.dto';


@Injectable()
export class EventsRepo {
    private readonly _eventModel: Model<EventDocument>
    constructor(@InjectModel(Event.name) eventModel: Model<EventDocument>) {
        this._eventModel = eventModel;
    }

    async getEventByPaging(condition: GetEventByCondition){
        const query: any = {};
        const time: any = {};
        const artist: any = {};

        if (condition.artist_id) {
            artist['InfoContents.artist_id'] = StringUtils.ObjectId(condition.artist_id)
        }

        const limit = condition.limit || 10;
        const skip = (condition.page - 1) * limit || 0;

        if (condition.time_from && condition.time_to) {
            time['InfoShowTimes.time_start'] = {
                $gte: new Date(condition.time_from),
                $lte: new Date(condition.time_to)
            };
        }

        const sort: any = {};
        if (condition.orderBy) {
            const [field, order] = condition.orderBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort['InfoShowTimes.time_start'] = -1;
        }

        if(condition.query){
            const regex = new RegExp(condition.query, 'i');
            query.$or = [
                { title: { $regex: regex } },
                {'InfoContents.InfoArtist.name': { $regex: regex }}
            ];
        }

        const events = await this._eventModel.aggregate([
            {
                $lookup: {
                    from: 'showtimes',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoShowTimes'
                }
            },
            {
               $match: time
            },
            {
                $lookup: {
                    from: 'content_events',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoContents'
                }
            },
            {
                $lookup: {
                    from: 'combo_events',
                    localField: 'combo_ids',
                    foreignField: '_id',
                    as: 'InfoCombos'
                }
            },
            {
                $unwind: '$InfoContents'
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'InfoContents.artist_id',
                    foreignField: '_id',
                    as: 'InfoContents.InfoArtist'
                }
            },
            {
                $match: artist
            },
            {
                $group: {
                    _id: '$_id',
                    title: {$first: '$title'},
                    code: {$first: '$code'},
                    type_event: {$first: '$type_event'},
                    venue: {$first: '$venue'},
                    category_id: {$first: '$category_id'},
                    desc: {$first: '$desc'},
                    seat_map_id: {$first: '$seat_map_id'},
                    slug: {$first: '$slug'},
                    status: {$first: '$status'},
                    show_artists: {$first: '$show_artists'},
                    custom_artists_text: {$first: '$custom_artists_text'},
                    createdAt: {$first: '$updatedAt'},
                    updatedAt: {$first: '$updatedAt'},
                    avatar: {$first: '$avatar'},
                    banner: {$first: '$banner'},
                    InfoShowTimes: {$first: '$InfoShowTimes'},
                    InfoContents: {$push: '$InfoContents'},
                    InfoCombos : {$first: '$InfoCombos'},
                }
            },
            {
                $match: query
            },
            {
                $sort: sort,
            },
            {
                $skip: skip 
            },
            {
                $limit: Number(condition.limit)
            },
        ])
        
        const total = await this._eventModel.aggregate([
            {
                $lookup: {
                    from: 'showtimes',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoShowTimes'
                }
            },
            {
               $match: time
            },
            {
                $lookup: {
                    from: 'content_events',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoContents'
                }
            },
            {
                $unwind: '$InfoContents'
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'InfoContents.artist_id',
                    foreignField: '_id',
                    as: 'InfoContents.InfoArtist'
                }
            },
            {
                $match: artist
            },
            {
                $group: {
                    _id: '$_id',
                    title: {$first: '$title'},
                    code: {$first: '$code'},
                    type_event: {$first: '$type_event'},
                    venue: {$first: '$venue'},
                    category_id: {$first: '$category_id'},
                    desc: {$first: '$desc'},
                    seat_map_id: {$first: '$seat_map_id'},
                    slug: {$first: '$slug'},
                    status: {$first: '$status'},
                    show_artists: {$first: '$show_artists'},
                    custom_artists_text: {$first: '$custom_artists_text'},
                    createdAt: {$first: '$updatedAt'},
                    updatedAt: {$first: '$updatedAt'},
                    avatar: {$first: '$avatar'},
                    banner: {$first: '$banner'},
                    InfoShowTimes: {$first: '$InfoShowTimes'},
                    InfoContents: {$push: '$InfoContents'},
                }
            },
            {
                $match: query
            }
        ])
        const totalCount = total.length

        return {
            events,
            total: totalCount,
            totalPages: Math.ceil(totalCount / condition.limit),
            currentPage: condition.page,
        };
    }

    async getDetailEvent(id: string){
        return await this._eventModel.aggregate([
            {
                $match: {
                    _id: StringUtils.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'showtimes',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoShowTimes'
                }
            },
            {
                $lookup: {
                    from: 'combo_events',
                    localField: 'combo_ids',
                    foreignField: '_id',
                    as: 'InfoCombos'
                }
            },
            {
                $lookup: {
                    from: 'content_events',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoContents'
                }
            },
            {
                $unwind: '$InfoContents'
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'InfoContents.artist_id',
                    foreignField: '_id',
                    as: 'InfoContents.InfoArtist'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    title: {$first: '$title'},
                    code: {$first: '$code'},
                    type_event: {$first: '$type_event'},
                    venue: {$first: '$venue'},
                    category_id: {$first: '$category_id'},
                    desc: {$first: '$desc'},
                    seat_map_id: {$first: '$seat_map_id'},
                    slug: {$first: '$slug'},
                    status: {$first: '$status'},
                    show_artists: {$first: '$show_artists'},
                    custom_artists_text: {$first: '$custom_artists_text'},
                    createdAt: {$first: '$updatedAt'},
                    updatedAt: {$first: '$updatedAt'},
                    avatar: {$first: '$avatar'},
                    banner: {$first: '$banner'},
                    InfoShowTimes: {$first: '$InfoShowTimes'},
                    InfoContents: {$push: '$InfoContents'},
                    InfoCombos: {$first: '$InfoCombos'},
                }
            },
            {
                $lookup: {
                    from: 'seat_maps',
                    localField: 'seat_map_id',
                    foreignField: '_id',
                    as: 'InfoSeatMap'
                }
            },
            {
                $unwind: '$InfoSeatMap'
            },
            {
                $lookup: {
                    from: 'seat_sections',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoSeatSections'
                }
            },
            // {
            //     $unwind: '$InfoSeatSections'
            // }
        ])
    }

    async createEvent(data: any): Promise<EventDocument> {
        return await this._eventModel.create(data);
    }

    async findEventById(id: any): Promise<EventDocument> {
        return await this._eventModel.findById(id);
    }

    async findEventByCondition(condition: any): Promise<EventDocument> {
        return await this._eventModel.findOne(condition);
    }

    async updateEvent(id: any, data: any): Promise<EventDocument> {
        return await this._eventModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteEvent(id: any) {
        return await this._eventModel.findByIdAndDelete(id);
    }

    async getDetailEventBySlug(slug: string){
        return await this._eventModel.aggregate([
            {
                $match: {
                    slug: slug
                }
            },
            {
                $lookup: {
                    from: 'showtimes',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoShowTimes'
                }
            },
            {
                $lookup: {
                    from: 'combo_events',
                    localField: 'combo_ids',
                    foreignField: '_id',
                    as: 'InfoCombos'
                }
            },
            {
                $lookup: {
                    from: 'content_events',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoContents'
                }
            },
            {
                $unwind: '$InfoContents'
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'InfoContents.artist_id',
                    foreignField: '_id',
                    as: 'InfoContents.InfoArtist'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    title: {$first: '$title'},
                    code: {$first: '$code'},
                    type_event: {$first: '$type_event'},
                    venue: {$first: '$venue'},
                    category_id: {$first: '$category_id'},
                    desc: {$first: '$desc'},
                    seat_map_id: {$first: '$seat_map_id'},
                    slug: {$first: '$slug'},
                    status: {$first: '$status'},
                    show_artists: {$first: '$show_artists'},
                    custom_artists_text: {$first: '$custom_artists_text'},
                    createdAt: {$first: '$updatedAt'},
                    updatedAt: {$first: '$updatedAt'},
                    avatar: {$first: '$avatar'},
                    banner: {$first: '$banner'},
                    InfoShowTimes: {$first: '$InfoShowTimes'},
                    InfoContents: {$push: '$InfoContents'},
                    InfoCombos: {$first: '$InfoCombos'}
                }
            },
            {
                $lookup: {
                    from: 'seat_maps',
                    localField: 'seat_map_id',
                    foreignField: '_id',
                    as: 'InfoSeatMap'
                }
            },
            {
                $unwind: '$InfoSeatMap'
            },
            {
                $lookup: {
                    from: 'seat_sections',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'InfoSeatSections'
                }
            },
            // {
            //     $unwind: '$InfoSeatSections'
            // }
        ])
    }

}