import { forwardRef, Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/events.schema';
import { UsersModule } from 'src/users/users.module';
import { EventsRepo } from './events.repo';
import { ShowtimesModule } from 'src/showtimes/showtimes.module';
import { Content_eventModule } from 'src/content_event/content_event.module';
import { Seat_sectionModule } from 'src/seat_section/seat_section.module';
import { MediaModule } from 'src/media/media.module';
import { OrdersModule } from 'src/orders/orders.module';
import { Combo_eventModule } from 'src/combo_event/combo_event.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    UsersModule,
    ShowtimesModule,
    Content_eventModule,
    Seat_sectionModule,
    forwardRef(() =>OrdersModule),
    MediaModule,
    Combo_eventModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepo],
  exports: [EventsService, EventsRepo]
})
export class EventsModule { }
