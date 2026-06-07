import { Category_eventRepo } from './category_event.repo';
import { Injectable } from "@nestjs/common";
import { CreateCategory } from './dto/create.dto';
import { StringUtils } from 'src/common/utils/string.utils';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class Category_eventService {
    constructor(private readonly _category_eventRepo: Category_eventRepo, ) {}

    async getCategoryByCondition(condition){
        const data = await this._category_eventRepo.getCategoryByCondition(condition);
        return data
    }

    async getCategoryById(id){
        return await this._category_eventRepo.findCategory_eventById(id);
    }

    async createCategoryEvent(createCategory: CreateCategory){
        const data = {
            _id: StringUtils.generateObjectId(),
            name: createCategory.name,
            slug: createCategory.slug
        }

        return await this._category_eventRepo.createCategory_event(data);
    }

    async updateCategoryEvent(cateId, updateCategory){
        return await this._category_eventRepo.updateCategory_event(cateId, updateCategory)
    }
}

