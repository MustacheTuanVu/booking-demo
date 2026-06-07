import { Injectable, Logger } from '@nestjs/common';
const TelegramBot = require('node-telegram-bot-api');
import * as os from 'node-os-utils';
import * as path from 'path';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import * as archiver from 'archiver';

const execPromise = util.promisify(exec);

@Injectable()
export class SystemService {
    private readonly botTele: any;
    private logger = new Logger(SystemService.name);

    constructor() {
        if (process.env.TELEGRAM_ENABLED === 'true') {
            try {
                this.botTele = new TelegramBot(process.env.TELEGRAM_TOKEN, { 
                    polling: false  // Set to false - chỉ send, không receive
                });
                this.logger.log('✅ Telegram Bot initialized successfully');
            } catch (error) {
                this.logger.error('❌ Failed to initialize Telegram Bot:', error.message);
            }
        } else {
            this.logger.warn('⚠️ Telegram Bot is DISABLED via environment variable');
        }
    }

    onReceiver = (message: any) => {
        this.logger.debug(message);
    };

    async sendMessenger(message: string) {
        if (!this.botTele) {
            this.logger.warn('⚠️ Telegram bot not initialized - message skipped');
            return;
        }

        if (!process.env.ID_GROUP_CHAT_TELE) {
            this.logger.warn('⚠️ ID_GROUP_CHAT_TELE not configured - message skipped');
            return;
        }
        
        try {
            await this.botTele.sendMessage(
                process.env.ID_GROUP_CHAT_TELE, 
                message,
                { parse_mode: 'HTML' }
            );
            this.logger.log('✅ Telegram message sent successfully');
        } catch (error) {
            this.logger.error('❌ Failed to send Telegram message:', error.message);
            throw error;
        }
    }

    async sendFile(filePath: string, caption: string = '') {
        const fs = require('fs');

        try {
            // Kiểm tra quyền truy cập file
            fs.accessSync(filePath, fs.constants.R_OK);
            // Kiểm tra file tồn tại
            if (!fs.existsSync(filePath)) {
                throw new Error(`File không tồn tại: ${filePath}`);
            }
            console.log('Đang gửi file:', filePath);

            // Gửi file qua Telegram (cập nhật tham số đúng)
            await this.botTele
                .sendDocument(process.env.ID_GROUP_CHAT_TELE, filePath, { caption: caption })
                .then((response) => {
                    console.log('File đã được gửi:', response);
                })
                .catch((error) => {
                    console.log('Có lỗi xảy ra:', error);
                });

            console.log('Gửi file thành công!');
        } catch (error) {
            console.error('Lỗi khi gửi file:', error.message);
        }
    }

    async checkSystemVPS() {
        const system = await this.getSystemInfo();
        console.log(`Ram: ${system}`);
        // await this.sendMessenger(`Project: ${process.env.NAME_PROJECT}\nCPU: ${system.cpu}\nRam: ${system.memory.usedMemMb}/${system.memory.totalMemMb} (${((system.memory.usedMemMb / system.memory.totalMemMb) * 100).toFixed(2)}%)\nDisk: ${system.disk.usedGb}/${system.disk.totalGb} Free: ${system.disk.freeGb} (${((system.disk.usedGb / system.disk.totalGb) * 100).toFixed(2)}%)`)
        return `Project: ${process.env.NAME_PROJECT}\nCPU: ${system.cpu}\nRam: ${system.memory.usedMemMb}/${system.memory.totalMemMb} (${((system.memory.usedMemMb / system.memory.totalMemMb) * 100).toFixed(2)}%)\nDisk: ${system.disk.usedGb}/${system.disk.totalGb} Free: ${system.disk.freeGb} (${((system.disk.usedGb / system.disk.totalGb) * 100).toFixed(2)}%)`;
    }

    private handleCommand(command: string, msg: any) {
        // const chatId = msg.chat.id;
        switch (command) {
            case 'TakaPos':
                // this.checkSystemVPS();
                break;
            case 'BackupPOS':
                // this.backupDatabase();
                break;
            case 'help':
                this.botTele.sendMessage(
                    process.env.ID_GROUP_CHAT_TELE,
                    'List of available commands:\n/TakaPos - Check Info system\n/BackupPOS - Backup database\n/help - Display this help message',
                );
                break;
            // Add more cases for other commands
            default:
                this.botTele.sendMessage(process.env.ID_GROUP_CHAT_TELE, 'Invalid command');
                break;
        }
    }

    async getSystemInfo() {
        // Lấy thông tin sử dụng CPU
        const cpuUsage = await os.cpu.usage();

        // Lấy thông tin bộ nhớ đã sử dụng
        const memoryUsage = await os.mem.used();

        // Lấy thông tin ổ đĩa
        const driveInfo = await os.drive.info();

        // Trả về tất cả thông tin trong một object
        return {
            cpu: cpuUsage,
            memory: memoryUsage,
            disk: driveInfo,
        };
    }

    async backupDatabase(res) {
        try {
            const backupPath = path.join(__dirname, '../../backup');

            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
            }

            const uri = process.env.MONGOURL;
            const dbName = process.env.DATABASE;
            const fileName = `backup-${process.env.NAME_PROJECT}-${new Date().toISOString()}.gz`;
            const backupFile = path.resolve(backupPath, fileName);
            const command = `mongodump --uri=${uri} \
                                   --authenticationDatabase=admin \
                                   --db=${dbName} \
                                   --archive=${backupFile} \
                                   --gzip`;
            await execPromise(command);
            // this.sendFile(backupFile, `Backup dự án: ${process.env.NAME_PROJECT}`);
            if (fs.existsSync(backupFile)) {
                // Nếu tồn tại, trả về file để tải xuống
                res.download(backupFile, fileName, (err) => {
                    if (err) {
                        console.error(`Error downloading the file: ${err.message}`);
                    }
                });
            } else {
                console.log(`Backup file does not exist: ${backupFile}`);
            }
            console.log(`Backup successful: ${backupFile}`);
            return backupFile;
        } catch (error) {
            console.error(`Backup failed: ${error.message}`);
        }
    }

    async backupImage(res: any) {
        const folderPath = path.resolve('public', 'uploads'); // Dùng path.resolve() cho chắc cú
        const zipPath = path.resolve('backup.zip'); // Lưu file zip ở thư mục gốc dự án

        if (!fs.existsSync(folderPath)) {
            return res.status(404).send('Thư mục không tồn tại');
        }

        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            res.download(zipPath, 'backup.zip', (err) => {
                if (err) {
                    console.error('Lỗi khi gửi file:', err);
                    res.status(500).send('Lỗi khi gửi file');
                }
                fs.unlinkSync(zipPath); // Xóa file sau khi gửi
            });
        });

        archive.on('error', (err) => {
            console.error('Lỗi khi nén file:', err);
            res.status(500).send('Lỗi khi nén file');
        });

        archive.pipe(output);
        archive.directory(folderPath, false); // Nén thư mục uploads
        archive.finalize();
    }
    async sendOrderNotification(orderData: any, userData: any, eventData?: any) {
        if (!this.botTele || process.env.TELEGRAM_NOTIFY_ORDER !== 'true') {
            this.logger.debug('Order notification skipped - bot disabled or feature flag off');
            return;
        }
        
        try {
            // Format price
            const formattedPrice = Number(orderData.total_price || 0).toLocaleString('vi-VN');
            
            // Format datetime
            const datetime = new Date().toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // Build seats info
            const orderItems = orderData.InfoOrderItems?.[0] || {};
            const seatsInfo = [
                orderItems.j_size && `J: ${orderItems.j_size}`,
                orderItems.q_size && `Q: ${orderItems.q_size}`,
                orderItems.k_size && `K: ${orderItems.k_size}`
            ].filter(Boolean).join(' | ') || 'N/A';
            
            // Build combo/items info
            const comboItems = [
                ...(orderItems.combo_info || []).map(c => c.name || 'Combo'),
                ...(orderItems.item_upsell || []).map(i => i.item_name || 'Item')
            ].join(', ') || 'Không có';
            
            // Build promotion info
            const promotionInfo = orderData.promotion 
                ? `\n🎁 Khuyến mãi: ${orderData.promotion.name} (-${Number(orderData.promotion.price).toLocaleString('vi-VN')} ${orderData.promotion.type_price})`
                : '';
            
            // Build message
            const message = `
🎉 <b>ĐƠN HÀNG MỚI THANH TOÁN THÀNH CÔNG</b>

📦 Mã đơn: <code>${orderData.code || 'N/A'}</code>
💰 Tổng tiền: <b>${formattedPrice} VND</b>
📅 Thời gian: ${datetime}

👤 <b>THÔNG TIN KHÁCH HÀNG</b>
├─ Tên: ${userData.name || 'N/A'}
├─ SĐT: ${userData.phone || 'N/A'}
└─ Email: ${userData.email || 'N/A'}

🎫 <b>CHI TIẾT ĐẶT CHỖ</b>
├─ Event: ${eventData?.name || 'N/A'}
├─ Showtime: ${eventData?.showtime || 'N/A'}
├─ Ghế: ${seatsInfo}
└─ Combo/Items: ${comboItems}

🔗 Chi tiết: ${process.env.FE_URI}/admin/orders/${orderData._id}

---
⏰ ${datetime}
            `.trim();
            
            await this.sendMessenger(message);
            this.logger.log(`✅ Order notification sent for order: ${orderData._id}`);
            
        } catch (error) {
            this.logger.error('❌ Failed to send order notification:', error.message);
            // Don't throw - notification failure shouldn't break the order flow
        }
    }

    async sendCTVRequestNotification(ticketData: any, userData: any) {
        if (!this.botTele || process.env.TELEGRAM_NOTIFY_CTV !== 'true') {
            this.logger.debug('CTV notification skipped - bot disabled or feature flag off');
            return;
        }
        
        try {
            const datetime = new Date().toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const message = `
👥 <b>YÊU CẦU ĐĂNG KÝ CỘNG TÁC VIÊN MỚI</b>

📋 Mã ticket: <code>${ticketData._id}</code>
📝 Tiêu đề: ${ticketData.title}
📅 Thời gian: ${datetime}

👤 <b>THÔNG TIN NGƯỜI GỬI</b>
├─ Tên: ${userData.name || 'N/A'}
├─ SĐT: ${userData.phone || 'N/A'}
├─ Email: ${userData.email || 'N/A'}

⏳ Trạng thái: <b>PENDING</b> (Chờ duyệt)

🔗 Xem chi tiết: ${process.env.FE_URI}/admin/tickets/${ticketData._id}

---
⏰ ${datetime}
            `.trim();
            
            await this.sendMessenger(message);
            this.logger.log(`✅ CTV notification sent for ticket: ${ticketData._id}`);
            
        } catch (error) {
            this.logger.error('❌ Failed to send CTV notification:', error.message);
            // Don't throw - notification failure shouldn't break the ticket creation flow
        }
    }
}
