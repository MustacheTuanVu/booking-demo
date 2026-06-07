import {TicketRepo } from './ticket.repo';import { Ticket, TicketSchema } from './schema/ticket.schema';import { TicketService } from './ticket.service';import { TicketController } from './ticket.controller';
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { MailerModule } from 'src/mailer/mailer.module';
import { SystemModule } from 'src/system/system.module';

@Module({
    imports: [UsersModule, MailerModule, SystemModule, MongooseModule.forFeature([{name: Ticket.name, schema: TicketSchema}])],
    controllers: [TicketController],
    providers: [TicketService, TicketRepo],
    exports: [TicketService, TicketRepo]
})
export class TicketModule {}

