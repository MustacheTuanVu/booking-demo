import {ArtistsRepo } from './artists.repo';import { Artists, ArtistsSchema } from './schema/artists.schema';import { ArtistsService } from './artists.service';import { ArtistsController } from './artists.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { MediaModule } from 'src/media/media.module';
import { Content_eventModule } from 'src/content_event/content_event.module';

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{name: Artists.name, schema: ArtistsSchema}]), 
    MediaModule,
    Content_eventModule],
    controllers: [ ArtistsController],
    providers: [ ArtistsService, ArtistsRepo],
    exports: [ ArtistsService, ArtistsRepo]
})
export class ArtistsModule {}

