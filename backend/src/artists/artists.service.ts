import { ArtistsRepo } from './artists.repo';
import { Injectable } from "@nestjs/common";
import { CreateArtists } from './dto/create.dto';
import { FILE_UPLOAD_AVATAR_ARTISTS } from 'src/common/constants/media.constants';
import { StringUtils } from 'src/common/utils/string.utils';
import { RandomCodeUtils } from 'src/common/utils/randomCode.utils';
import { HandelFile } from 'src/common/utils/handelFile.utils';
import { MediaService } from 'src/media/media.service';
import { TypeImage } from 'src/media/enum/type.enum';
import { UpdateArtists } from './dto/update.dto';
import { MessageCode } from 'src/common/exception/MessageCode';
import { Content_eventService } from 'src/content_event/content_event.service';

@Injectable()
export class ArtistsService {
    constructor(private readonly _artistsRepo: ArtistsRepo, 
                private readonly _mediaService: MediaService, 
                private readonly _contentEventService: Content_eventService
            ) {}

    async createArtists(createArtists: CreateArtists, file) {

        const id = StringUtils.generateObjectId();
        const data = {
            _id: id,
            name: createArtists.name,
            bio: createArtists.bio,
            link: createArtists.link
        }
        const imageName = RandomCodeUtils.generateUniqueCode(10);
        const dataCreate = await this._artistsRepo.createArtists(data);

        if (file && dataCreate) {
            await this._mediaService.uploadImage(file, TypeImage.ARTIST, imageName, FILE_UPLOAD_AVATAR_ARTISTS, undefined, id)
            const dataUpdate = await this._artistsRepo.updateArtists(id, { image: `${FILE_UPLOAD_AVATAR_ARTISTS}/${imageName}.png` })
            return dataUpdate;
        }
        return dataCreate;
    }

    async updateArtist(id, update: UpdateArtists, file) {
        const artist = await this._artistsRepo.findArtistsById(id);

        if(!artist){
            throw MessageCode.ARTISTS.ARTISTS_NOT_FOUND;
        }
        
        const res = await this._artistsRepo.updateArtists(id, update)

        if (file) {
            if (artist.image) {
                const [dir, name] = await HandelFile.extractPathAndFileName(artist.image);
                const imageCompress = await HandelFile.compressFile(file);
                const check = await HandelFile.handleFileImageUploadWhenExist(imageCompress, name, dir)
            } else {
                const imageName = RandomCodeUtils.generateUniqueCode(10);
                // const check = await HandelFile.handleFileImageUpload(file, imageName, FILE_UPLOAD_AVATAR_ARTISTS)
                const check = await this._mediaService.uploadImage(file, TypeImage.ARTIST, imageName, FILE_UPLOAD_AVATAR_ARTISTS, undefined, id)
                if (check) {
                    const dataUpdate = await this._artistsRepo.updateArtists(id, { image: `${FILE_UPLOAD_AVATAR_ARTISTS}/${imageName}.png` })
                    console.log(dataUpdate)
                }
            }
        }
        return res
    }


    async getArtistsById(id) {
        return await this._artistsRepo.findArtistsById(id);
    }

    async getArtistsByCondition(condition) {
        return await this._artistsRepo.getArtistsByCondition(condition);
    }

    async getArtistsBySlug(slug){
        const artist: any = await this._artistsRepo.findArtistsBySlug(slug);

        const performances = await this._contentEventService.findByArtistId({ artist_id: artist._id});

        return {...artist.toObject(), performances}
    }

    async deleteArtists(id) {
        await this._mediaService.deleteMultiCondition(StringUtils.ObjectId(id));
        return await this._artistsRepo.deleteArtists(id);
    }
}

