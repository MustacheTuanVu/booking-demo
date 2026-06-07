import { forwardRef, Module } from '@nestjs/common';
import { GatewayWebSocket } from './gateway.gateway';
import { GatewayService } from './gateway.service';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { RuntimeStateModule } from 'src/runtime-state/runtime-state.module';

@Module({
    imports: [UsersModule, RuntimeStateModule, forwardRef(()=>OrdersModule)], 
    providers: [GatewayWebSocket, GatewayService],
    exports: [GatewayService, GatewayWebSocket],
})
export class GatewayModule {}
