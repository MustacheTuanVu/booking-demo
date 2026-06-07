import { Global, Module } from '@nestjs/common';
import { RuntimeStateService } from './runtime-state.service';

@Global()
@Module({
    providers: [RuntimeStateService],
    exports: [RuntimeStateService],
})
export class RuntimeStateModule {}
