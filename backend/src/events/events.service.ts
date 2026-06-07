import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventsRepo } from './events.repo';
import { CreateEventDto } from './dto/create.dto';
import { ShowtimesService } from 'src/showtimes/showtimes.service';
import { Content_eventService } from 'src/content_event/content_event.service';
import { Seat_sectionService } from 'src/seat_section/seat_section.service';
import { StringUtils } from 'src/common/utils/string.utils';
import { MessageCode } from 'src/common/exception/MessageCode';
import { MediaService } from 'src/media/media.service';
import { TypeImage } from 'src/media/enum/type.enum';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { FILE_UPLOAD_BANNER_EVENT, FILE_UPLOAD_LOGO_EVENT } from 'src/common/constants/media.constants';
import { GetEventByCondition } from './dto/getByCondition.dto';
import { UpdateEventDto } from './dto/update.dto';
import { OrdersService } from 'src/orders/orders.service';
import { Combo_eventService } from 'src/combo_event/combo_event.service';
import { HandelFile } from 'src/common/utils/handelFile.utils';

@Injectable()
export class EventsService {
    constructor(private readonly _eventRepo: EventsRepo,
        private readonly _showTimeService: ShowtimesService,
        private readonly _contentEventService: Content_eventService,
        private readonly _seatSelectionService: Seat_sectionService,
        private readonly _mediaService: MediaService,
        @Inject(forwardRef(() => OrdersService)) private readonly _orderService: OrdersService,
        private readonly _comboEventService: Combo_eventService
    ) { }

    async createEvent(createEvent: CreateEventDto) {
        // console.log('🔵 [DEBUG] createEvent called with:', JSON.stringify(createEvent, null, 2));
        const idEvent = StringUtils.generateObjectId();

        // check slug
        const slugData = await this._eventRepo.findEventByCondition({ slug: createEvent.slug });
        if (slugData) {
            createEvent.slug = createEvent.slug + '-' + idEvent
            throw MessageCode.EVENT.SLUG_EVENT_EXIST;
        }

        // check combo
            const foundItems = await this._comboEventService.findComboEventByManyId(createEvent.combo_ids);
            if (foundItems.length !== createEvent.combo_ids.length) {
                throw MessageCode.COMBO.COMBO_NOT_FOUND;
            }
        //

        // Validation: show_artists & custom_artists_text
        if (createEvent.show_artists === false && !createEvent.custom_artists_text) {
            throw MessageCode.EVENT.CUSTOM_TEXT_REQUIRED;
        }

        const showArtists = createEvent.show_artists !== false;

        const dataEvent = {
            _id: idEvent,
            title: createEvent.title,
            code: RandomCodeUtils.generateUniqueCode(10),
            type_event: createEvent.type_event,
            venue: createEvent.venue,
            category_id: StringUtils.ObjectId(createEvent.category_id),
            desc: createEvent.desc,
            combo_ids: createEvent.combo_ids,
            seat_map_id: StringUtils.ObjectId(createEvent.seat_map_id),
            slug: createEvent.slug,
            status: createEvent.status,
            show_artists: showArtists,
            custom_artists_text: createEvent.custom_artists_text || null
        }

        const showsTimeData = createEvent.showsTimeData.map(item => ({ ...item }))
        const contentEventData = createEvent.contentEventData.map(item => ({ ...item }))
        const seatSelectionData = createEvent.seatSelectionData.map(item => ({ ...item }))

        // return Promise.all([
        //     this._eventRepo.createEvent(dataEvent),
        //     this._showTimeService.createManyShowtimes(idEvent, showsTimeData),
        //     this._contentEventService.createManyContent_event(idEvent, contentEventData),
        //     this._seatSelectionService.createManySeat_section(idEvent, createEvent.seat_map_id, seatSelectionData)
        // ])
        try {
            const event = await this._eventRepo.createEvent(dataEvent);
            const showtimes = await this._showTimeService.createManyShowtimes(event._id, showsTimeData);
            const content = await this._contentEventService.createManyContent_event(event._id, contentEventData);
            const seatSection = await this._seatSelectionService.createManySeat_section(event._id, createEvent.seat_map_id, seatSelectionData);
            return [event, showtimes, content, seatSection]
        } catch (error) {
            console.error("Có lỗi, rollback dữ liệu...");
            await this._eventRepo.deleteEvent(idEvent); // Xóa event
            await this._showTimeService.deleteShowtimes(idEvent); // Xóa showtimes
            await this._contentEventService.deleteContentEvent(idEvent); // Xóa nội dung
            await this._seatSelectionService.deleteSeatSelection(idEvent); // Xóa ghế
            throw error; // Báo lỗi ra ngoài
        }
    }

    async updateImage(eventId: string, files: any[]): Promise<any> {
        const event = await this._eventRepo.findEventById(eventId);

        if (!event) { 
            throw MessageCode.EVENT.EVENT_NOT_FOUND;
        }

        try {
            for (const [index, item] of files.entries()) {
                if (index === 0) {
                    await this._mediaService.uploadImage(item, TypeImage.LOGO_EVENT, `${event.code}_logo`, FILE_UPLOAD_LOGO_EVENT, undefined, event._id);
                } else {
                    await this._mediaService.uploadImage(item, TypeImage.BANNER_EVENT, `${event.code}_banner`, FILE_UPLOAD_BANNER_EVENT, undefined, event._id);
                }
            }

            const dataUpdate = await this._eventRepo.updateEvent(event._id, {
                avatar: `${FILE_UPLOAD_LOGO_EVENT}/${event.code}_logo.png`,
                banner: `${FILE_UPLOAD_BANNER_EVENT}/${event.code}_banner.png`
            });

            return dataUpdate;
        } catch (error) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }
    }

    async updateEvent(idEvent, updateEvent: UpdateEventDto) {

        const showsTimeData = updateEvent?.showsTimeData?.map(item => ({ ...item })) || [];
        const contentEventData = updateEvent?.contentEventData?.map(item => ({ ...item })) || [];
        const seatSelectionData = updateEvent?.seatSelectionData?.map(item => ({ ...item })) || [];

        if(updateEvent.combo_ids){
            const foundItems = await this._comboEventService.findComboEventByManyId(updateEvent.combo_ids);
            if (foundItems.length !== updateEvent.combo_ids.length) {
                throw MessageCode.COMBO.COMBO_NOT_FOUND;
            }
        }

        // Validation: show_artists & custom_artists_text
        if (updateEvent.show_artists === false && !updateEvent.custom_artists_text) {
            const currentEvent = await this._eventRepo.findEventById(idEvent);
            if (!currentEvent.custom_artists_text) {
                throw MessageCode.EVENT.CUSTOM_TEXT_REQUIRED;
            }
        }

        const dataEvent = {
            ...(updateEvent.title && { title: updateEvent.title }),
            ...(updateEvent.type_event && { type_event: updateEvent.type_event }),
            ...(updateEvent.venue && { venue: updateEvent.venue }),
            ...(updateEvent.category_id && { category_id: StringUtils.ObjectId(updateEvent.category_id) }),
            ...(updateEvent.desc && { desc: updateEvent.desc }),
            ...(updateEvent.seat_map_id && { seat_map_id: StringUtils.ObjectId(updateEvent.seat_map_id) }),
            ...(updateEvent.slug && { slug: updateEvent.slug }),
            ...(updateEvent.status && { status: updateEvent.status }),
            ...(updateEvent.show_artists !== undefined && { show_artists: updateEvent.show_artists }),
            ...(updateEvent.custom_artists_text !== undefined && { custom_artists_text: updateEvent.custom_artists_text })
        }

        return Promise.all([
            this._eventRepo.updateEvent(idEvent, dataEvent),
            updateEvent.showsTimeData && this._showTimeService.updateShowtimes(showsTimeData),
            updateEvent.contentEventData && this._contentEventService.updateContent_event(contentEventData, idEvent),
            updateEvent.seatSelectionData && this._seatSelectionService.updateSeat_section(updateEvent.seat_map_id, seatSelectionData)
        ])
    }

    async deleteEvent(eventId){
        // delete event showstime, content, seatSection

        // check user buy ticket
        const dataTicket = await this._orderService.getTicketInEvent(eventId);
        if(dataTicket.length > 0){
            throw MessageCode.EVENT.EVENT_HAS_ORDER
        }

        const res = Promise.all([
            this._eventRepo.deleteEvent(eventId),
            this._showTimeService.deleteShowtimes(eventId),
            this._contentEventService.deleteContentEvent(eventId),
            this._mediaService.deleteMultiCondition(StringUtils.ObjectId(eventId)),
            this._seatSelectionService.deleteSeatSelection(eventId)
        ])

        return res;
    }

    async getEventByCondition(query: GetEventByCondition) {
        return await this._eventRepo.getEventByPaging(query)
    }

    async getDetailEvent(idEvent) { 
        return await this._eventRepo.getDetailEvent(idEvent);
    }

    async getDetailEventBySlug(slug) {
        const eventData = await this._eventRepo.getDetailEventBySlug(slug);

        if (!eventData || eventData.length === 0) {
            return {
                _id: null,
                remainingSeats: null // Object chứa { J: số_ghế_J_còn_lại, Q: số_ghế_Q_còn_lại, K: số_ghế_K_còn_lại }
            };
        }

        // Lấy thông tin số ghế còn lại
        const remainingSeats = await this._seatSelectionService.getSizeSeat(eventData[0]._id);

        // Thêm thông tin số ghế còn lại vào dữ liệu sự kiện
        return {
            ...eventData[0],
            remainingSeats // Object chứa { J: số_ghế_J_còn_lại, Q: số_ghế_Q_còn_lại, K: số_ghế_K_còn_lại }
        };
    }

}
