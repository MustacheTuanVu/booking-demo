import { Membership_logsRepo } from './membership_logs.repo';
import { Membership_logs, Membership_logsSchema } from './schema/membership_logs.schema';
import { Membership_logsService } from './membership_logs.service';
import { Membership_logsController } from './membership_logs.controller';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        MongooseModule.forFeature([{ name: Membership_logs.name, schema: Membership_logsSchema }]),
    ],
    controllers: [Membership_logsController],
    providers: [Membership_logsService, Membership_logsRepo],
    exports: [Membership_logsService, Membership_logsRepo],
})
export class Membership_logsModule {}
