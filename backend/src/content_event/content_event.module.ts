import {Content_eventRepo } from './content_event.repo';import { Content_event, Content_eventSchema } from './schema/content_event.schema';import { Content_eventService } from './content_event.service';import { Content_eventController } from './content_event.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ArtistsModule } from 'src/artists/artists.module';

@Module({
    imports: [UsersModule, 
        // ArtistsModule,
        MongooseModule.forFeature([{name: Content_event.name, schema: Content_eventSchema}])],
    controllers: [ Content_eventController],
    providers: [ Content_eventService, Content_eventRepo],
    exports: [ Content_eventService, Content_eventRepo]
})
export class Content_eventModule {}

