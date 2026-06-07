import * as fs from 'fs';
import { promisify } from 'util';
import * as path from "path";

const writeFileAsync = promisify(fs.writeFile);
const accessAsync = promisify(fs.access);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const F_OK = fs.constants.F_OK;
const sharp = require('sharp');


export class HandelFile {
    static async handleFileImageUpload(file: any, name: string, path: string): Promise<boolean> {
        const newFileName = `${name}.png`; // Tên mới = tag + phần mở rộng
        const filePath = `${path}/${newFileName}`; // Đường dẫn đầy đủ của file

        // Tạo folder nếu chưa có
        if (!fs.existsSync(path)) {
            await mkdirAsync(path, { recursive: true });
        }

        try {
            // Kiểm tra xem file đã tồn tại hay chưa
            await accessAsync(filePath, F_OK);
            console.log(`File ${newFileName} đã tồn tại. Không lưu đè.`);
            return false; // Trả về false nếu file đã tồn tại
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                // Nếu file chưa tồn tại, tiến hành lưu file
                try {
                    await writeFileAsync(filePath, file.buffer); // Lưu file từ buffer
                    console.log(`File ${newFileName} đã được lưu thành công.`);
                    return true; // Trả về true nếu lưu thành công
                } catch (writeError) {
                    console.error('Lỗi khi lưu file:', writeError);
                    return false; // Trả về false nếu có lỗi khi lưu file
                }
            } else {
                // Nếu gặp lỗi khác ngoài ENOENT
                console.error('Lỗi không xác định:', err);
                return false; // Trả về false nếu gặp lỗi khác
            }
        }
    }

    static async handleFileImageUploadWhenExist(file, name: string, path: string, buffer?: any): Promise<boolean> {

        if (!file && !buffer) {
            console.error('Không có dữ liệu để lưu.');
            return false;
        }

        // Tạo folder nếu chưa có
        if (!fs.existsSync(path)) {
            await mkdirAsync(path, { recursive: true });
        }
        
        const newFileName = `${name}.png`; // Tên mới = tag + phần mở rộng
        const filePath = `${path}/${newFileName}`; // Đường dẫn đầy đủ của file
        let data = file?.buffer || buffer;

        if (data instanceof ArrayBuffer) {
            data = Buffer.from(data);
        }
        try {
            await writeFileAsync(filePath, data); // Lưu file từ buffer
            console.log(`File ${newFileName} đã được lưu thành công.`);
            return true; // Trả về true nếu lưu thành công
        } catch (error) {
            console.error('Lỗi không xác định:', error);
            return false; // Trả về false nếu gặp lỗi khác
        }
    }

    static async deleteFile(filePath: string): Promise<boolean> {
        try {
            // Kiểm tra nếu file tồn tại
            await accessAsync(filePath, F_OK);
            // Xóa file
            await unlinkAsync(filePath);
            console.log(`File ${filePath} đã được xóa thành công.`);
            return true; // Trả về true nếu xóa thành công
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.error(`File ${filePath} không tồn tại.`);
            } else {
                console.error(`Lỗi khi xóa file:`, error);
            }
            return false; // Trả về false nếu có lỗi
        }
    }

    static extractPathAndFileName(filePath: string): [string, string] {
        const dirPath = path.dirname(filePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        return [dirPath, fileName];
    }
 
    static async compressFile(file: any) {
        try {
            if (!file.buffer) {
              throw new Error('File buffer is missing');
            }
        
            const compressedBuffer = await sharp(file.buffer)
              .resize({ width: 1024 })
              .jpeg({ quality: 80 })
              .toBuffer();
        
            if (!compressedBuffer) {
              throw new Error('Failed to compress file');
            }
        
            return {
              ...file,
              buffer: compressedBuffer,
              size: compressedBuffer.length,
            };
          } catch (error) {
            console.error('Error compressing file:', error);
            throw new Error('Failed to compress the file');
          }
    }
}
