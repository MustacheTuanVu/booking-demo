import { Combo_eventRepo } from './combo_event.repo';
import { Injectable } from "@nestjs/common";
import { CreateComboEventDto } from './dto/create.dto';
import { StringUtils } from 'src/common/utils/string.utils';
import { Menu_orderService } from 'src/menu_order/menu_order.service';
import { Status } from 'src/common/enum/status.enum';
import { MessageCode } from 'src/common/exception/MessageCode';
import { UpdateComboEventDto } from './dto/update.dto';
import { GetComboEventByCondition } from './dto/condition.dto';

@Injectable()
export class Combo_eventService {
    constructor(private readonly _combo_eventRepo: Combo_eventRepo, 
                private readonly _menu_orderService: Menu_orderService
    ) {}

    async getComboEventByCondition(condition: GetComboEventByCondition){
        const data = await this._combo_eventRepo.getComboEventByCondition(condition);
        const {combo} = data;

        const handelData = combo.map(combo => {
            if (!combo.MenuOrder || !combo.MenuOrder.items) {
                return combo; // Nếu không có items thì trả nguyên combo
            }
    
            const groupedItems = combo.MenuOrder.items.reduce((acc, item) => {
                if (!acc[item.type]) {
                    acc[item.type] = [];
                }
                acc[item.type].push(item);
                return acc;
            }, {} as Record<string, any[]>);
    
            return {
                ...combo,
                 // Gộp nhóm items vào object chính
                MenuOrder: {
                    ...combo.MenuOrder,
                    ...groupedItems,
                    items: undefined // Xóa mảng items gốc
                }
            };
        });
        data.combo = handelData;
        return data;
    }

    async getDetailComboEvent(id){
        const data = await this._combo_eventRepo.getDetailComboEvent(id);
        if(data.length === 0 || data[0]?.MenuOrder.length === 0){
            throw MessageCode.COMBO.COMBO_NOT_FOUND;
        }
        const handelData = data[0].MenuOrder.items.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = [];
            }
            acc[item.type].push(item);
            return acc;
        }, {} as Record<string, any[]>);

        data[0].MenuOrder.infoMenu = handelData;
        data[0].MenuOrder.items = undefined;

        return data;
    }

    async createComboEvent(data: CreateComboEventDto){

        // check menu active
        const menu = await this._menu_orderService.findMenu_orderById(data.menu_id);

        if (!menu || menu.status === Status.INACTIVE) {
            throw MessageCode.MENU.NOT_FOUND;
        }


        const dataCreate = {
            _id: StringUtils.generateObjectId(),
            name: data.name,
            size_seat: data.size_seat,
            size_food: data.size_food,
            size_drink: data.size_drink,
            price: data.price,
            price_origin: data.price_origin,
            menu_id: StringUtils.ObjectId(data.menu_id),
            status: data.status,
            is_show_upsell: data.is_show_upsell !== undefined ? data.is_show_upsell : true
        }

        return await this._combo_eventRepo.createCombo_event(dataCreate);
    }

    async updateComboEvent(id, data: UpdateComboEventDto){

        if(data.menu_id){
            const menu = await this._menu_orderService.findMenu_orderById(data.menu_id);
            if (!menu || menu.status === Status.INACTIVE) {
                throw MessageCode.MENU.NOT_FOUND;
            }
        }

        return await this._combo_eventRepo.updateCombo_event(id, data);
    }

    async deleteComboEvent(id){
        return await this._combo_eventRepo.deleteCombo_event(id);
    }

    async findComboEventByManyId(ids: string[]){
        return await this._combo_eventRepo.findComboEventByManyId(ids);
    }

    async getComboByIds(combo_ids: any){
        return await this._combo_eventRepo.findComboEventByManyId(combo_ids);
    }

    async checkItemInCombo(comboId, itemIds){
        return await this._combo_eventRepo.checkItemInCombo(comboId, itemIds);
    }

    async countPrice(comboIds){
        const data = await this._combo_eventRepo.countPrice(comboIds)
        return data
    }
}

