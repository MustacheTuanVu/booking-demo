import {MediaRepo } from './media.repo';
import { Media, MediaSchema } from './schema/media.schema';
import { MediaService } from './media.service';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{name: Media.name, schema: MediaSchema}])],
    providers: [MediaService, MediaRepo],
    exports: [MediaService, MediaRepo]
})
export class MediaModule {}

