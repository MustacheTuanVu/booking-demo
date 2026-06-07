import { StringUtils } from 'src/common/utils/string.utils';
import { CreateMenuItem } from './dto/create.dto';
import { Menu_itemRepo } from './menu_item.repo';
import { Injectable } from '@nestjs/common';
import { MessageCode } from 'src/common/exception/MessageCode';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { HandelFile } from 'src/common/utils/handelFile.utils';
import { FILE_UPLOAD_ITEM_MENU } from 'src/common/constants/media.constants';
import { MediaService } from 'src/media/media.service';
import { TypeImage } from 'src/media/enum/type.enum';
import { Category_itemService } from 'src/category_item/category_item.service';
import { Status } from 'src/common/enum/status.enum';
import { TypeItem } from './enum/type.enum';

@Injectable()
export class Menu_itemService {
    constructor(
        private readonly _menu_itemRepo: Menu_itemRepo,
        private readonly _categoryService: Category_itemService,
        private readonly _mediaService: MediaService,
    ) {}

    async createMenuItem(createItem: CreateMenuItem) {
        const data = {
            _id: StringUtils.generateObjectId(),
            name: createItem.name,
            desc: createItem.desc,
            ...(createItem.ingredient && { ingredient: createItem.ingredient }),
            ...(createItem.flavor && { flavor: createItem.flavor }),
            category_id: StringUtils.ObjectId(createItem.category_id),
            ...(createItem.type && { type: createItem.type }),
            unit: createItem.unit,
            status: createItem.status,
            price: createItem.price,
            ...(createItem.item_id_cukcuk && {
                item_id_cukcuk: createItem.item_id_cukcuk,
            }),
            ...(createItem.item_name_cukcuk && {
                item_name_cukcuk: createItem.item_name_cukcuk,
            }),
            ...(createItem.unit_id_cukcuk && {
                unit_id_cukcuk: createItem.unit_id_cukcuk,
            }),
            ...(createItem.unit_name_cukcuk && {
                unit_name_cukcuk: createItem.unit_name_cukcuk,
            }),
        };
        return await this._menu_itemRepo.createMenu_item(data);
    }

    async updateImageMennuItem(itemId, file) {
        const item = await this._menu_itemRepo.findMenu_itemById(itemId);
        const imageName = RandomCodeUtils.generateUniqueCode(20);

        if (file) {
            await this._mediaService.uploadImage(
                file,
                TypeImage.ITEM,
                imageName,
                FILE_UPLOAD_ITEM_MENU,
                undefined,
                item._id,
            );
            const dataUpdate = await this._menu_itemRepo.updateMenu_item(itemId, {
                image: `${FILE_UPLOAD_ITEM_MENU}/${imageName}.png`,
            });
            return dataUpdate;
        }

        throw MessageCode.REQUEST.BAD_REQUEST;
    }

    async uploadImageByCukcukId(infoImage: any) {
        // console.log('imageInffo', infoImage)
        // const item = await this._menu_itemRepo.findOneMenu_itemByCondition({item_id_cukcuk: infoImage.idCukcuk})
        const item = await this._menu_itemRepo.findMenu_itemById(infoImage._id);
        if (!item) throw MessageCode.MENU.ITEM_NOT_FOUND;
        let imageName = '';
        if (item.image) {
            const [dir, name] = await HandelFile.extractPathAndFileName(item.image);
            imageName = name;
        } else {
            imageName = RandomCodeUtils.generateUniqueCode(20);
        }

        await this._mediaService.uploadImage(
            infoImage.buffer,
            TypeImage.ITEM,
            imageName,
            FILE_UPLOAD_ITEM_MENU,
            undefined,
            item._id,
        );

        return await this.updateMenuItem(item._id, {
            image: `${FILE_UPLOAD_ITEM_MENU}/${imageName}.png`,
        });
    }

    async deleteMenuItem(id) {
        await this._mediaService.deleteMultiCondition(StringUtils.ObjectId(id));
        return await this._menu_itemRepo.deleteMenu_item(id);
    }

    async findMenu_itemByManyId(ids) {
        return await this._menu_itemRepo.findMenu_itemByCondition({
            _id: { $in: ids },
        });
    }

    async getMenuItemById(id) {
        return await this._menu_itemRepo.findMenu_itemById(id);
    }

    async getMenuItemByCondition(condition) {
        return await this._menu_itemRepo.getMenuItemByCondition(condition);
    }

    async updateMenuItem(id, updateItem) {
        return await this._menu_itemRepo.updateMenu_item(id, updateItem);
    }

    // Used by the local Excel importer. Legacy field names are kept for data compatibility.
    async updateCreateItem(
        item,
        version: number,
        callback?: (type: 'create' | 'update' | 'count') => void,
    ) {
        callback?.('count');
        const check = await this._menu_itemRepo.findOneMenu_itemByCondition({
            item_id_cukcuk: item.Id,
        });
        const category = await this._categoryService.getOneCategoryByCondition({
            category_id_cukcuk: item.CategoryID,
        });

        if (item.CategoryID === '00000000-0000-0000-0000-000000000000') {
            return;
        }

        const data = {
            name: item.Name,
            desc: item.Description,
            category_id: category ? category._id : null,
            unit: item.UnitName,
            status: item.Inactive ? Status.INACTIVE : Status.ACTIVE,
            price: item.Price,
            type: [1, 2, 3].includes(item.ItemType)
                ? TypeItem.FOOD
                : [5, 6].includes(item.ItemType)
                  ? TypeItem.DRINK
                  : 'DONKNOW',
            code_cukcuk: item.Code,
            item_id_cukcuk: item.Id,
            item_name_cukcuk: item.Name,
            unit_id_cukcuk: item.UnitID,
            unit_name_cukcuk: item.UnitName,
            __v: version,
        };

        if (check) {
            await this._menu_itemRepo.updateMenu_item(check._id, data);
            callback?.('update');
            return;
        }

        const id = StringUtils.generateObjectId();
        await this._menu_itemRepo.createMenu_item({ _id: id, ...data });
        await this._menu_itemRepo.updateMenu_item(id, { __v: version });
        callback?.('create');
    }

    async countPrice(orderUpsell) {
        // Lấy danh sách combo theo itemId
        const itemIds = orderUpsell.map((item) => StringUtils.ObjectId(item.itemId));
        const combos = await this.findMenu_itemByManyId(itemIds);

        // Tạo map từ itemId -> quantity
        const quantityMap = new Map(orderUpsell.map((item) => [item.itemId, item.quantity]));

        // Tính tổng giá dựa trên price * quantity
        const totalPrice = combos.reduce((sum, combo) => {
            const quantity = quantityMap.get(combo._id.toString()) || 0;
            return sum + combo.price * Number(quantity);
        }, 0);

        return totalPrice;
    }

    async getNewVersion() {
        return await this._menu_itemRepo.getNewVersion();
    }

    async deleteOldVersion(oldVer: number) {
        return await this._menu_itemRepo.deleteOldVersion(oldVer);
    }
}
