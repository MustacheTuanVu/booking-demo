import { Body, Controller, Get, Param, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Control } from 'src/common/meta/control.meta';
import { MailerService } from './mailer.service';
import { MailerSendDTO } from './dto/mailerSend.dto';
import { Public } from 'src/common/meta/public.meta';
import { Description } from 'src/common/meta/description.meta';

@Control('mailer')
export class MailerController {
    constructor(private readonly _emailService: MailerService) {
        // this._mailerService = mailerService;
    }

    @Public()
    @Post('send')
    @Description('Gửi mail', [{ status: 200, description: 'create successfully' }])
    async sendEmail(@Body() mailerSendDTO: MailerSendDTO) {
        const res = await this._emailService.sendEmailPaid(mailerSendDTO.to, mailerSendDTO.victim, mailerSendDTO.order, mailerSendDTO.link);
        return res;
    }
}


