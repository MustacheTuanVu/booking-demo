import { Roles } from 'src/common/meta/role.meta';
import { ArtistsService } from './artists.service';
import { Control } from "src/common/meta/control.meta";
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateArtists } from './dto/create.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiFile } from 'src/common/meta/upload-file.meta';
import { GetArtistsByCondition } from './dto/condition.dto';
import { UpdateArtists } from './dto/update.dto';;


@Control('artists')
export class ArtistsController {
    constructor(private readonly _artistsService: ArtistsService,) { }

    @Get('GetMany')
    @Description('Lấy thông tin artists by condition', [{ status: 200, description: 'Create successfully' }])
    async getArtistsByCondition(@Query() condition: GetArtistsByCondition) {
        return await this._artistsService.getArtistsByCondition(condition);
    }

    @Get('GetById/:id')
    @Description('Lấy thông tin artist theo id', [{ status: 200, description: 'Create successfully' }])
    async getArtistById(@Param('id') id: string) {
        return await this._artistsService.getArtistsById(id);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('Create')
    @ApiConsumes('multipart/form-data')
    @ApiFile()
    @UseInterceptors(FileInterceptor('file'))
    @Description('Tạo một ca sĩ mới', [{ status: 200, description: 'Create successfully' }])
    async createArtists(@Body() createArtists: CreateArtists, @UploadedFile() file) {
        return await this._artistsService.createArtists(createArtists, file);
    }

    @Get('GetBySlug/:slug')
    @Description('Lấy thông tin artist theo id', [{ status: 200, description: 'Create successfully' }])
    async getArtistBySlug(@Param('slug') slug: string) {
        return await this._artistsService.getArtistsBySlug(slug);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Put('Create')
    @ApiConsumes('multipart/form-data')
    @ApiFile()
    @UseInterceptors(FileInterceptor('file'))
    @Description('Update ca sĩ', [{ status: 200, description: 'Create successfully' }])
    async updateArtists(@Query('id') id: string, @Body() update: UpdateArtists, @UploadedFile() file) {
        return await this._artistsService.updateArtist(id, update, file);
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Put('Delete')
    @Description('Delete ca sĩ', [{ status: 200, description: 'Create successfully' }])
    async deleteArtists(@Query('id') id: string) {
        return await this._artistsService.deleteArtists(id);
    }
}

