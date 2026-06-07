import { UsersService } from 'src/users/users.service';
import { MediaRepo } from './media.repo';
import { Injectable } from "@nestjs/common";
import { MessageCode } from 'src/common/exception/MessageCode';
import { StringUtils } from 'src/common/utils/string.utils';
import { TypeImage } from './enum/type.enum';
import { HandelFile } from 'src/common/utils/handelFile.utils';

@Injectable()
export class MediaService {
    constructor(private readonly _mediaRepo: MediaRepo,) { }

    async addMultiImage(data: any) {
        const res = await this._mediaRepo.createMultiMedia(data);
        return res;
    }

    async uploadImage(file, type, filename, baseLink, uid?: string, relative_id?: string) {
        if (file) {
            const imageCompress = await HandelFile.compressFile(file);
            const data = {
                _id: StringUtils.generateObjectId(),
                ...(uid && { uid: StringUtils.ObjectId(uid) }),
                ...(relative_id && { relative_id: StringUtils.ObjectId(relative_id) }),
                type: type,
                link: `${baseLink}/${filename}.png`
            }
            const checkLink = await this._mediaRepo.findOneMediaByCondition({ link: `${baseLink}/${filename}.png` })
            let dataRes = null;
            if (!checkLink) {
                dataRes = await this._mediaRepo.createMedia(data);
            }
            try {
                await HandelFile.handleFileImageUploadWhenExist(imageCompress, filename, baseLink)
            } catch (error) {
                HandelFile.deleteFile(`${baseLink}/${filename}.png`);
                throw new Error("File upload failed");
            }

            return dataRes;
        }
    }

    async deleteImage(id: string): Promise<any> {
        const listImage = await this._mediaRepo.findMediaById(id);
        const res = await this._mediaRepo.deleteMedia(id);
        if (res) {
            HandelFile.deleteFile(listImage.link)
            return res
        }
    }

    async deleteMultiCondition(id_relative) {
        const listImage = await this._mediaRepo.findMediaByCondition({ relative_id: id_relative });
        const res = await this._mediaRepo.deleteMultiCondition(id_relative);
        if (res.deletedCount > 0) {
            listImage.forEach(item => {
                HandelFile.deleteFile(item.link)
            });
            return res;
        }
    }

}

