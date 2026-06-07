import { StringUtils } from 'src/common/utils/string.utils';
import { Menu_orderRepo } from './menu_order.repo';
import { Injectable } from '@nestjs/common';
import { Menu_itemService } from 'src/menu_item/menu_item.service';
import { MessageCode } from 'src/common/exception/MessageCode';
import { HandelFile } from 'src/common/utils/handelFile.utils';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { FILE_UPLOAD_MENU_ORDER } from 'src/common/constants/media.constants';
import { MediaService } from 'src/media/media.service';
import { TypeImage } from 'src/media/enum/type.enum';

@Injectable()
export class Menu_orderService {
    constructor(
        private readonly _menu_orderRepo: Menu_orderRepo,
        private readonly _menu_itemService: Menu_itemService,
        private readonly _mediaService: MediaService,
    ) {}

    async createMenuOrder(createItem, file) {
        // check _id in items from menu_item
        const foundItems = await this._menu_itemService.findMenu_itemByManyId(createItem.items);
        if (foundItems.length !== createItem.items.length) {
            throw MessageCode.MENU.ITEM_NOT_FOUND;
        }
        const mnOrderId = StringUtils.generateObjectId();
        const data = {
            _id: mnOrderId,
            name: createItem.name,
            description: createItem.description,
            type: createItem.type,
            image: createItem.image,
            items: createItem.items,
            status: createItem.status,
        };

        const res = await this._menu_orderRepo.createMenu_order(data);
        if (!res) return null;
        const imageName = RandomCodeUtils.generateUniqueCode(20);
        if (res && file) {
            await this._mediaService.uploadImage(
                file,
                TypeImage.MENU_ORDER,
                imageName,
                FILE_UPLOAD_MENU_ORDER,
                undefined,
                mnOrderId,
            );
        }
        const dataUpdate = await this._menu_orderRepo.updateMenu_order(res._id, {
            image: `${FILE_UPLOAD_MENU_ORDER}/${imageName}.png`,
        });
        return dataUpdate;
    }

    async updateMenuOrder(id, updateItem, file) {
        if (updateItem.items) {
            const foundItems = await this._menu_itemService.findMenu_itemByManyId(updateItem.items);
            console.log(foundItems.length, updateItem.items.length);
            if (foundItems.length !== updateItem.items.length) {
                throw MessageCode.MENU.ITEM_NOT_FOUND;
            }
        }

        const menu = await this._menu_orderRepo.findMenu_orderById(id);

        const update = await this._menu_orderRepo.updateMenu_order(id, updateItem);

        if (file) {
            let imageName = '';
            if (menu.image) {
                const [dir, name] = HandelFile.extractPathAndFileName(menu.image);
                imageName = name;
            } else {
                imageName = RandomCodeUtils.generateUniqueCode(20);
            }

            await this._mediaService.uploadImage(
                file,
                TypeImage.MENU_ORDER,
                imageName,
                FILE_UPLOAD_MENU_ORDER,
                undefined,
                id,
            );
            const dataUpdate = await this._menu_orderRepo.updateMenu_order(id, {
                image: `${FILE_UPLOAD_MENU_ORDER}/${imageName}.png`,
            });
            return dataUpdate;
        }
        return update;
    }

    async deleteMenuOrder(id) {
        await this._mediaService.deleteMultiCondition(StringUtils.ObjectId(id))
        return await this._menu_orderRepo.deleteMenu_order(id);
    }

    async getMenuOrderByCondition(condition) {
        const data = await this._menu_orderRepo.getMenuOrderByCondition(condition);

        const { menuOrder } = data;

        const newData = menuOrder.map((order) => {
            const groupedItems = order.items.reduce(
                (acc, item) => {
                    if (!acc[item.type]) {
                        acc[item.type] = [];
                    }
                    acc[item.type].push(item);
                    return acc;
                },
                {} as Record<string, any[]>,
            );

            return {
                ...order,
                ...groupedItems, // Gộp các nhóm items vào object chính
                items: undefined, // Xóa mảng items gốc
            };
        });

        data.menuOrder = newData;

        return data;
    }

    async findMenu_orderById(menu_event_id) {
        return await this._menu_orderRepo.findMenu_orderById(menu_event_id);
    }
}
