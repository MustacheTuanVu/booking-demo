import { Category_itemRepo } from './category_item.repo';
import { Injectable } from '@nestjs/common';
import { CreateCategoryItem } from './dto/create.dto';
import { StringUtils } from 'src/common/utils/string.utils';
import { UpdateCategoryItem } from './dto/update.dto';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { HandelFile } from 'src/common/utils/handelFile.utils';
import { FILE_UPLOAD_CATEGORY_ITEM } from 'src/common/constants/media.constants';
import { MediaService } from 'src/media/media.service';
import { TypeImage } from 'src/media/enum/type.enum';
import { MessageCode } from 'src/common/exception/MessageCode';

@Injectable()
export class Category_itemService {
    constructor(
        private readonly _category_itemRepo: Category_itemRepo,
        private readonly _mediaService: MediaService,
    ) {}

    async getCategoryByCondition(condition) {
        const data = await this._category_itemRepo.getCategoryByCondition(condition);
        return data;
    }

    async getOneCategoryByCondition(condition) {
        const data = await this._category_itemRepo.findOneCategory_itemByCondition(condition);
        return data;
    }

    async getCategoryById(id) {
        return await this._category_itemRepo.findCategory_itemById(id);
    }

    async createCategoryItem(createCategory: CreateCategoryItem) {
        const data = {
            _id: StringUtils.generateObjectId(),
            name: createCategory.name,
            code: createCategory.code,
            slug: createCategory.slug,
            ...(createCategory.category_id_cukcuk && {
                category_id_cukcuk: createCategory.category_id_cukcuk,
            }),
            ...(createCategory.category_name_cukcuk && {
                category_name_cukcuk: createCategory.category_name_cukcuk,
            }),
        };
        return await this._category_itemRepo.createCategory_item(data);
    }

    async updateCategoryItem(id, updateCategory) {
        console.log(id, updateCategory);
        return await this._category_itemRepo.updateCategory_item(id, updateCategory);
    }

    async deleteCategoryItem(id) {
        await this._mediaService.deleteMultiCondition(StringUtils.ObjectId(id));
        return await this._category_itemRepo.deleteCategory_item(id);
    }

    async updateImageCategoryItem(itemId, file) {
        const item = await this._category_itemRepo.findCategory_itemById(itemId);
        const imageName = RandomCodeUtils.generateUniqueCode(20);

        if (file) {
            await this._mediaService.uploadImage(
                file,
                TypeImage.CATEGORY_ITEM,
                imageName,
                FILE_UPLOAD_CATEGORY_ITEM,
                undefined,
                item._id,
            );
            const dataUpdate = await this._category_itemRepo.updateCategory_item(itemId, {
                image: `${FILE_UPLOAD_CATEGORY_ITEM}/${imageName}.png`,
            });
            return dataUpdate;
        }

        throw MessageCode.REQUEST.BAD_REQUEST;
    }

    // Used by the local Excel importer. Legacy field names are kept for data compatibility.
    async updateCreateItem(
        item,
        version: number,
        callback?: (type: 'create' | 'update') => void,
    ) {
        const check = await this._category_itemRepo.findOneCategory_itemByCondition({
            category_id_cukcuk: item.Id,
        });

        if (item.CategoryType === 1) {
            return;
        }

        const data = {
            name: item.Name,
            code: item.Code,
            slug: item.Code,
            category_id_cukcuk: item.Id,
            category_name_cukcuk: item.Name,
            __v: version,
        };

        if (check) {
            await this._category_itemRepo.updateCategory_item(check._id, data);
            callback?.('update');
            return;
        }

        const id = StringUtils.generateObjectId();
        await this._category_itemRepo.createCategory_item({ _id: id, ...data });
        await this._category_itemRepo.updateCategory_item(id, { __v: version });
        callback?.('create');
    }

    async getNewVersion() {
        return await this._category_itemRepo.getNewVersion();
    }

    async deleteOldVersion(oldVer: number) {
        return await this._category_itemRepo.deleteOldVersion(oldVer);
    }
}
