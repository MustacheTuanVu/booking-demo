import { Roles } from 'src/common/meta/role.meta';
import { OrdersService } from './orders.service';
import { Control } from "src/common/meta/control.meta";
import { UserRole } from 'src/users/enum/role.enum';
import { Body, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Description } from 'src/common/meta/description.meta';
import { CreateOrder } from './dto/create.dto';
import { User } from 'src/common/meta/user.meta';
import { GetOrderByCondition } from './dto/condition.dto';
import { PhoneDto } from './dto/phone.dto';

@Control('orders') 
export class OrdersController {
    constructor(private readonly _ordersService: OrdersService,) { }

    // @Roles(UserRole.USER)
    @Post('Create')
    @Description('Tạo một order mới', [{ status: 200, description: 'Create successfully' }])
    async createOrder(@User() username, @Body() createOrder: CreateOrder, @Query() phone: PhoneDto) {
        console.log('phone', phone, typeof phone)
        if(phone && JSON.stringify(phone) != "{}"){
            if (phone.phone) {
                return await this._ordersService.createOrder(phone.phone, createOrder);
            } else {
                return await this._ordersService.createOrder(phone.email, createOrder);
            }
            
        }else if(username){
            console.log('đặt không phone')
            return await this._ordersService.createOrder(username, createOrder);
        }
    }

    @Roles(UserRole.ADMIN, UserRole.BOSS)
    @Post('staff-create')
    @Description('Nhân viên đặt vé cho khách', [{ status: 200, description: 'Create successfully' }])
    async createOrderByStaff(@Req() req: any, @Body() createOrder: any) {
        return await this._ordersService.createOrderByStaff(req.user.username, createOrder);
    }


    @Get('GetMany')
    @Roles(UserRole.ADMIN, UserRole.BOSS, UserRole.USER)
    @Description('Lấy thông tin Order by condition', [{ status: 200, description: 'Create successfully' }])
    async getOrderByCondition(@Query() condition: GetOrderByCondition) {
        return await this._ordersService.getOrderByCondition(condition);
    }



    @Get('GetMyOrder')
    @Roles(UserRole.USER)
    @Description('Lấy thông tin Order của tôi', [{ status: 200, description: 'Create successfully' }])
    async GetMyOrder(@Req() req: any, @Query() condition: GetOrderByCondition) {
        // console.log('req.user.username', req.user)
        let dataUser: any = null;

        if (req.user.username) {
            dataUser = req.user.username;
        } else if (req.user.phone) {
            dataUser = req.user.phone;
        } else if (req.user.email) {
            dataUser = req.user.email;
        }
        const orderList = await this._ordersService.getOrderByCondition(condition, dataUser);
        return orderList;
    }

    @Get('GetById/:id')
    @Description('Lấy thông tin theo id', [{ status: 200, description: 'Create successfully' }])
    async getOrderById(@Param('id') id: string) {
        return await this._ordersService.getOrderById(id);
    }

    @Get('testSKIO')
    @Description('Test socket IO', [{ status: 200, description: 'Get successfully' }])
    async testSocketIO(@Query('eventId') eventId: string, @Query('showtimeId') showtimeId: string) {
        return await this._ordersService.testSocketIO(eventId, showtimeId);
    }

    @Get('GetSizeOrder')
    @Description('Lấy số lượng ghế đã đặt', [{ status: 200, description: 'Create successfully' }])
    async getSizeOrder(@Query('eventId') eventId: string) {
        return await this._ordersService.findSeatBooking(eventId)
    }

}
