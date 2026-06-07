import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepo } from './users.repo';
import { MediaModule } from 'src/media/media.module';
import { Membership_logsModule } from 'src/membership_logs/membership_logs.module';
import { Membership_pricesModule } from 'src/membership_prices/membership_prices.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}]), 
    MediaModule, forwardRef(() => Membership_logsModule), 
    forwardRef(() =>Membership_pricesModule),
    forwardRef(() =>AuthModule)],
    controllers: [UsersController],
    providers: [UsersService, UsersRepo],
    exports: [UsersService, UsersRepo]
})
export class UsersModule {}
