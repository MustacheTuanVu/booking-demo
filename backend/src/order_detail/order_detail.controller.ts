import { Roles } from 'src/common/meta/role.meta';
import { Order_detailService } from './order_detail.service';
import { Control } from "src/common/meta/control.meta";
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Post, Query } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { UpdateMenuFree } from './dto/updateComboFree.dto';

@Control('order_detail')
export class Order_detailController {
    constructor(private readonly _order_detailService: Order_detailService, ){}

      @Roles(UserRole.ADMIN, UserRole.USER, UserRole.BOSS)
      @Post('UpdateOrderDetail')
      @Description('Update Order Info', [
        { status: 200, description: 'Update successfully' },
      ])
      async updateOrderDetail(@Query('orderId') orderId: string, @Body() data : UpdateMenuFree) {
        return await this._order_detailService.updateOrderDetail(orderId, data);
      }
}

