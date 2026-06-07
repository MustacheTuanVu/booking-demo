import { Injectable, OnModuleInit } from '@nestjs/common';
import { scheduleJob } from 'node-schedule'; // Sửa lại cách import

@Injectable()
export class ScheduleService implements OnModuleInit {
    constructor() {}

    onModuleInit() {
        scheduleJob('30 20 * * *', () => { // Sử dụng trực tiếp hàm scheduleJob
            console.log('Running checkSystemVPS at 20:30');
        });
        scheduleJob('00 02 * * *', () => { // Sử dụng trực tiếp hàm scheduleJob
            console.log('Running backupDatabase at 02:00');
        });
    }
}
