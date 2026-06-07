import { Get, Query, Res } from '@nestjs/common';
import { Control } from 'src/common/meta/control.meta';
import { Description } from 'src/common/meta/description.meta';
import { Public } from 'src/common/meta/public.meta';
import { Roles } from 'src/common/meta/role.meta';
import { SystemService } from './system.service';
import { TypeCodeDto } from './dto/typeCode.dto';

@Control('system')
export class SystemController {

    constructor(private readonly _systemService: SystemService){}
    
    @Public()
    @Get('sendInfoSystem')
    @Description('Lấy thông tin hệ thống', [{status: 200, description: 'create successfully'}])
    async getInfoSystem(){
        return await this._systemService.checkSystemVPS();
    }

    @Public()
    @Get('backupDatabase')
    @Description('Backup dữ liệu', [{status: 200, description: 'create successfully'}])
    async getBackup(@Res() res: any){
        return await this._systemService.backupDatabase(res); 
    }

    @Public()
    @Get('backupImage')
    @Description('Backup dữ liệu', [{status: 200, description: 'create successfully'}])
    async backupImage(@Res() res: any){
        return await this._systemService.backupImage(res); 
    }

    @Public()
    @Get('test-telegram')
    @Description('Test Telegram notification', [
        { status: 200, description: 'Test message sent successfully' },
        { status: 500, description: 'Failed to send message' }
    ])
    async testTelegram() {
        try {
            await this._systemService.sendMessenger('🧪 <b>TEST TELEGRAM NOTIFICATION</b>\n\nĐây là tin nhắn test từ Booking System.\n\n✅ Telegram bot hoạt động bình thường!');
            return { 
                success: true, 
                message: 'Test message sent to Telegram group successfully',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { 
                success: false, 
                message: 'Failed to send test message',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    @Public()
    @Get('telegram-status')
    @Description('Check Telegram bot status', [
        { status: 200, description: 'Status retrieved successfully' }
    ])
    async getTelegramStatus() {
        const enabled = process.env.TELEGRAM_ENABLED === 'true';
        const hasToken = !!process.env.TELEGRAM_TOKEN;
        const hasGroupId = !!process.env.ID_GROUP_CHAT_TELE;
        const orderNotifyEnabled = process.env.TELEGRAM_NOTIFY_ORDER === 'true';
        const ctvNotifyEnabled = process.env.TELEGRAM_NOTIFY_CTV === 'true';

        return {
            enabled,
            configured: hasToken && hasGroupId,
            features: {
                orderNotification: orderNotifyEnabled,
                ctvNotification: ctvNotifyEnabled
            },
            timestamp: new Date().toISOString()
        };
    }
}
