import { Injectable, Res } from '@nestjs/common';
import { GetMenuItemByCondition } from 'src/menu_item/dto/condition.dto';
import { Menu_itemService } from 'src/menu_item/menu_item.service';
// import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { MessageCode } from 'src/common/exception/MessageCode';
import { Status } from 'src/common/enum/status.enum';
import { Category_itemService } from 'src/category_item/category_item.service';
// import * as Tesseract from 'tesseract.js';
// import * as Jimp from 'jimp';
import * as fs from 'fs';
import { PromotionService } from 'src/promotion/promotion.service';
import { GetPromotionByCondition } from 'src/promotion/dto/condition.dto';
import { CreatePromotion } from 'src/promotion/dto/create.dto';
import { UsersService } from 'src/users/users.service';
import { TypePromotion } from 'src/promotion/enum/type.enum';
import { MediaService } from 'src/media/media.service';
import { getUserByCondition } from 'src/analytics/dto/getUserByCondition.dto';
import { StringUtils } from 'src/common/utils/string.utils';
import { TicketCondition } from 'src/ticket/dto/condition.dto';
import { TicketService } from 'src/ticket/ticket.service';
import { BankService } from 'src/bank/bank.service';

@Injectable()
export class ToolExcelService {
    constructor(
        private readonly _menuItemService: Menu_itemService,
        private readonly _categoryItemService: Category_itemService,
        private readonly _promotionService: PromotionService,
        private readonly _userService: UsersService,
        private readonly _mediaService: MediaService,
        private readonly _ticketService: TicketService,
        private readonly _bankService: BankService,
    ) {}

    async updateFileExcel(file) {
        if (!file) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.worksheets[0];

        const data: any[] = [];
        const dataCate: any[] = [];
        const uniqueCategories = new Set();
        const images = [];

        // Lấy dữ liệu từ dòng thứ 3 trở đi (bỏ qua tiêu đề)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) {
                const rowData = {
                    stt: row.getCell(1).value,
                    Code: row.getCell(2).value,
                    Name: row.getCell(3).value,
                    Image: null,
                    Description: row.getCell(5).value,
                    category_id: {
                        Name: row.getCell(6).value,
                        Code: row.getCell(7).value,
                        Id: row.getCell(8).value,
                    },
                    CategoryID: row.getCell(8).value,
                    Price: row.getCell(9).value,
                    UnitName: row.getCell(10).value,
                    Inactive: row.getCell(11).value === Status.INACTIVE ? true : false,
                    Id: row.getCell(12).value,
                    UnitID: row.getCell(13).value,
                    _id: row.getCell(14).value,
                };
                data.push(rowData);
                const categoryKey = `${rowData.category_id.Id}`;
                if (!uniqueCategories.has(categoryKey)) {
                    uniqueCategories.add(categoryKey);
                    dataCate.push(rowData.category_id);
                }
            }
        });

        let create = 0;
        let update = 0;

        const itemCurentVer = await this._menuItemService.getNewVersion();
        const verItem = itemCurentVer?.__v || 0;
        const newVerItem = verItem + 1;

        const cateCurentVer = await this._categoryItemService.getNewVersion();
        const verCate = cateCurentVer?.__v || 0;
        const newVerCate = verCate + 1;

        for (let item of dataCate) {
            await this._categoryItemService.updateCreateItem(item, newVerCate, (type) => {
                if (type === 'create') create++;
                if (type === 'update') update++;
            });
        }

        for (let item of data) {
            await this._menuItemService.updateCreateItem(item, newVerItem, (type) => {
                if (type === 'create') create++;
                if (type === 'update') update++;
            });
        }

        const deleteItems = await this._menuItemService.deleteOldVersion(verItem);
        const deleteCate = await this._categoryItemService.deleteOldVersion(verCate);
        // Xóa ảnh
        for (const item of deleteItems) {
            if (item?.image) {
                await this._mediaService.deleteMultiCondition(item._id);
            }
        }
        for (const item of deleteCate) {
            if (item?.image) {
                await this._mediaService.deleteMultiCondition(item._id);
            }
        }

        worksheet.getImages().forEach((image) => {
            const imageId = image.imageId;
            const row = image.range.tl.nativeRow + 1; // Dòng chứa ảnh
            const idCukcuk = worksheet.getRow(row).getCell(12).value;
            const _id = worksheet.getRow(row).getCell(14).value;
            if (!idCukcuk) {
                throw MessageCode.MENU.ITEM_NOT_FOUND_CUKCUK_ID;
            }
            // Lấy dữ liệu ảnh từ workbook
            const excelImage = workbook.model.media.find((m: any) => m.index === imageId);
            if (excelImage) {
                images.push({
                    _id: _id,
                    idCukcuk: idCukcuk,
                    extension: excelImage.extension, // png, jpg...
                    buffer: excelImage.buffer, // Dữ liệu ảnh
                });
                // Gán ảnh vào dữ liệu tương ứng
                const targetRow = data.find((d) => d.stt == row);
                if (targetRow) {
                    targetRow.Image = `image_${row}.${excelImage.extension}`;
                }
            }
        });

        if (images.length > 0) {
            const uploadImage = await Promise.all(
                images.map((item) => this._menuItemService.uploadImageByCukcukId(item)),
            );
        }

        // Trả về JSON
        return { menuItem: data, create: create, update: update };
    }

    async uploadFileGuestUser(file) {
        if (!file) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.worksheets[0];

        const data: any[] = [];

        // Lấy dữ liệu từ dòng thứ 3 trở đi (bỏ qua tiêu đề)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) {
                const rowData = {
                    stt: row.getCell(1).value,
                    phone: row.getCell(2).value,
                    name: row.getCell(3).value,
                };
                data.push(rowData);
            }
        });

        const expiryRaw = worksheet.getCell('E1').value;

        let expiryDate: Date;

        if (typeof expiryRaw === 'number') {
            // Convert từ Excel serial number sang Date
            const excelEpoch = new Date(1899, 11, 30); // Excel bắt đầu từ 30/12/1899
            expiryDate = new Date(excelEpoch.getTime() + expiryRaw * 86400000); // 86400000 ms = 1 ngày
        } else if (expiryRaw instanceof Date) {
            expiryDate = expiryRaw;
        } else {
            console.error('Cell E1 không hợp lệ, kiểm tra lại format trong Excel!');
            throw new Error('Invalid Excel date format');
        }

        // Điều chỉnh múi giờ nếu cần (nếu bị lệch múi giờ)
        expiryDate.setUTCHours(expiryDate.getUTCHours() + 7);

        console.log('Ngày chuẩn:', expiryDate.toISOString());

        const dataUpdate: any[] = [];
        for (let item of data) {
            const guest = {
                phone: item.phone,
                is_guest: true,
                expiry: expiryDate.toISOString(),
            };
            dataUpdate.push(guest);
        }
        console.log(dataUpdate);
        return await this._userService.updateGuestUser({
            guests: dataUpdate,
        });
    }

    async downloadFileMenuItem(dataQuery: GetMenuItemByCondition, @Res() res) {
        const data = await this._menuItemService.getMenuItemByCondition(dataQuery);
        const items = data?.menuItem;
        if (items.length <= 0) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Thông tin sản phẩm');
        worksheet.mergeCells('A1:L1'); // Merge từ cột A đến I tại dòng 1
        const styleSell = worksheet.getRow(1);
        styleSell.font = { bold: true, size: 16 }; // Style cho tiêu đề
        styleSell.alignment = { horizontal: 'center', vertical: 'middle' }; // Canh giữa cho tiêu đề

        // Tạo header
        const headers = [
            'STT',
            'Mã SP',
            'Tên SP',
            'Hình ảnh',
            'Mô tả',
            'Danh Mục',
            'Mã Danh Mục',
            'ID Danh Mục CukCuk',
            'Giá',
            'Đơn vị tính',
            'Trạng thái',
            'item_id_cukcuk',
            'unit_id_cukcuk',
            'id',
        ];
        // Thêm header vào worksheet
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);

        // Style cho header
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25; // Chiều cao cho header

        const filteredData = [];
        const filteredImage = [];
        items.forEach((product: any, index) => {
            const rowIndex = index + 0;
            const baseRow = [
                index + 1,
                product.code_cukcuk,
                product.name,
                '',
                product.desc,
                product.category_id.name,
                product.category_id.code,
                product.category_id.category_id_cukcuk,
                product.price,
                product.unit,
                product.status,
                product.item_id_cukcuk,
                product.unit_id_cukcuk,
                String(product._id),
            ];

            if (fs.existsSync(product.image)) {
                const data = {
                    filename: product.image,
                    extension: 'png',
                    row: rowIndex + 2,
                    col: 3,
                    name: product.name,
                };
                filteredImage.push(data);
            }
            filteredData.push(baseRow);
        });

        worksheet.addRows(filteredData);

        filteredImage.forEach((img) => {
            if (fs.existsSync(img.filename)) {
                const imageId = workbook.addImage({
                    filename: img.filename,
                    extension: img.extension,
                });

                // Điều chỉnh kích thước ô cho ảnh vừa vặn
                worksheet.getColumn(img.col).width = 15; // Độ rộng cột
                worksheet.getRow(img.row).height = 80; // Chiều cao dòng

                // Chèn ảnh vào vị trí xác định
                worksheet.addImage(imageId, {
                    tl: { col: img.col, row: img.row },
                    ext: { width: 80, height: 80 }, // Kích thước ảnh
                });

                console.log(`Đã chèn ảnh ${img.name} vào row ${img.row}, col ${img.col}`);
            } else {
                console.error(`Lỗi: Không tìm thấy ảnh ${img.filename}`);
            }
        });

        worksheet.columns = headers.map((header, index) => ({
            header,
            key: header,
            width: index === 3 ? 35 : index === 0 ? 5 : 20, // Độ rộng cột tùy chỉnh
        }));

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                row.height = 80;
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                };
            });
        });

        const titleSell = worksheet.getCell('A1');
        titleSell.value = 'Thông tin sản phẩm'; // Gán giá trị tiêu đề

        // Gửi file về client
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', 'attachment; filename="updated-file.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    }

    async updateFileVoucher(file) {
        if (!file) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.worksheets[0];

        const data: any[] = [];

        let create = 0;

        // Lấy dữ liệu từ dòng thứ 3 trở đi (bỏ qua tiêu đề)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) {
                const rowData = {
                    code: row.getCell(2).value,
                    name: row.getCell(3).value,
                    desc: row.getCell(4).value,
                    expired: row.getCell(5).value,
                    type_price: row.getCell(10).value,
                    price: Number(row.getCell(7).value),
                    required_points: Number(row.getCell(8).value),
                    max_quantity: Number(row.getCell(9).value),
                    for: row.getCell(10).value,
                    status: row.getCell(11).value,
                } as CreatePromotion;

                data.push(rowData);
            }
        });
        const createdIds: string[] = [];
        try {
            // Thêm từng item và lưu lại ID
            const res = await Promise.all(
                data.map(async (item) => {
                    const createdItem = await this._promotionService.createPromotion(item);
                    createdIds.push(createdItem._id);
                    return createdItem;
                }),
            );

            return res;
        } catch (error) {
            console.error('Lỗi khi tạo promotion:', error);

            // Rollback: Xóa hết những cái đã thêm
            await Promise.all(createdIds.map((id) => this._promotionService.deletePromotion(id)));

            throw new Error('Đã rollback do gặp lỗi khi thêm promotion!');
        }
    }

    async downloadFileVoucher(dataQuery, @Res() res) {
        const data = await this._promotionService.getPromotionByAdmin(dataQuery);
        const promotions = data?.promotion;
        if (promotions.length <= 0) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Thông tin khuyến mãi');
        worksheet.mergeCells('A1:K1'); // Merge từ cột A đến I tại dòng 1
        const styleSell = worksheet.getRow(1);
        styleSell.font = { bold: true, size: 16 }; // Style cho tiêu đề
        styleSell.alignment = { horizontal: 'center', vertical: 'middle' }; // Canh giữa cho tiêu đề

        // Tạo header
        const headers = [
            'STT',
            'Code',
            'Tên Voucher',
            'Mô tả',
            'Hạn sủ dụng',
            `Khuyến mãi theo [${TypePromotion.PERCENT}, ${TypePromotion.VND}]`,
            'Giá',
            'Điểm đổi',
            'Số lượng',
            'Dành cho hạng',
            'Trạng thái',
        ];
        // Thêm header vào worksheet
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);

        // Style cho header
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25; // Chiều cao cho header

        const filteredData = [];
        console.log(promotions);
        promotions.forEach((item: any, index) => {
            const baseRow = [
                index + 1,
                item.code,
                item.name,
                item.desc,
                item.expired,
                item.type_price,
                item.price,
                item.required_points,
                item.max_quantity,
                item.for,
                item.status,
            ];

            filteredData.push(baseRow);
        });

        worksheet.addRows(filteredData);

        worksheet.columns = headers.map((header, index) => ({
            header,
            key: header,
            width: index === 3 ? 35 : index === 0 ? 5 : 20, // Độ rộng cột tùy chỉnh
        }));

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                };
            });
        });

        const titleSell = worksheet.getCell('A1');
        titleSell.value = 'Thông tin khuyến mãi'; // Gán giá trị tiêu đề

        // Gửi file về client
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', 'attachment; filename="updated-file.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    }

    async downloadFileCollaborator(query: getUserByCondition, res) {
        const dataVTC = await this._userService.getRevenueReportForStaffOrCustomer(query);
        const data = dataVTC.data;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Thông tin CTV');
        worksheet.mergeCells('A1:I1'); // Merge từ cột A đến I tại dòng 1
        worksheet.mergeCells('J1:L1');
        const styleSell = worksheet.getRow(1);
        styleSell.font = { bold: true, size: 16 }; // Style cho tiêu đề
        styleSell.alignment = { horizontal: 'center', vertical: 'middle' }; // Canh giữa cho tiêu đề

        // Tạo header
        const headers = [
            'STT',
            'Tên CTV',
            'Số điện thoại',
            'Mã giới thiệu',
            'Email',
            'Điểm hiện tại',
            'Tổng đơn hàng giới thiệu',
            'Tổng doanh thu giới thiệu',
            'Tên ngân hàng',
            'Tên người thụ hưởng',
            'Số tài khoản',
        ];
        // Thêm header vào worksheet
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);

        // Style cho header
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25; // Chiều cao cho header

        const filteredData = [];
        data.forEach((item: any, index) => {
            const baseRow = [
                index + 1,
                item.name,
                item.phone,
                item.referral_code,
                item.email,
                item.point,
                item.totalOrders,
                item.totalOrderPrice,
                item.BankInfo.length > 0 ? item.BankInfo[0].bankName : '',
                item.BankInfo.length > 0 ? item.BankInfo[0].accountHolderName : '',
                item.BankInfo.length > 0 ? item.BankInfo[0].accountNumber : '',
            ];

            filteredData.push(baseRow);
        });

        worksheet.addRows(filteredData);

        worksheet.columns = headers.map((header, index) => ({
            header,
            key: header,
            width: index === 3 ? 35 : index === 0 ? 5 : 20, // Độ rộng cột tùy chỉnh
        }));

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                };
            });
        });

        const titleSell = worksheet.getCell('A1');
        titleSell.value = 'Thông tin cộng tác viên'; // Gán giá trị tiêu đề

        if (query.time_from && query.time_to) {
            const timeQuerySell = worksheet.getCell('J1');
            timeQuerySell.value = `Từ ${StringUtils.formatDateString(String(query.time_from))} Đến ${StringUtils.formatDateString(String(query.time_to))}`; // Gán giá trị tiêu đề
        }
        // Gửi file về client
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', 'attachment; filename="updated-file.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    }

    async downloadExcelTicket(username, query: TicketCondition, res) {
        const dataTiket = await this._ticketService.getTicketsByCondition(username, query);
        const data = dataTiket.tickets;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Thông tin yêu cầu');
        worksheet.mergeCells('A1:I1'); // Merge từ cột A đến I tại dòng 1
        worksheet.mergeCells('J1:L1');
        const styleSell = worksheet.getRow(1);
        styleSell.font = { bold: true, size: 16 }; // Style cho tiêu đề
        styleSell.alignment = { horizontal: 'center', vertical: 'middle' }; // Canh giữa cho tiêu đề

        // Tạo header
        const headers = [
            'STT',
            'Tên CTV',
            'Số điện thoại',
            'Mã giới thiệu',
            'Email',
            'Điểm hiện tại',
            'Loại yêu cầu',
            'Yêu cầu',
            'Tên ngân hàng',
            'Tên người thụ hưởng',
            'Số tài khoản',
        ];
        // Thêm header vào worksheet
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(2);

        // Style cho header
        headerRow.font = { bold: true, size: 12 };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25; // Chiều cao cho header

        const filteredData = [];
        for (let index = 0; index < data.length; index++) {
            const item: any = data[index];

            const baseRow = [
                index + 1,
                item?.uid?.name,
                item?.uid?.phone,
                item?.uid?.referral_code,
                item?.uid?.email,
                item?.uid?.point,
                item?.type,
                `${item?.price} vnđ`,
            ];

            // Get bank info
            const bank = await this._bankService.getOneBankUser(item.uid);
            baseRow.push(bank?.bankName || '');
            baseRow.push(bank?.accountHolderName || '');
            baseRow.push(bank?.accountNumber || '');

            filteredData.push(baseRow);
        }

        worksheet.addRows(filteredData);

        worksheet.columns = headers.map((header, index) => ({
            header,
            key: header,
            width: index === 3 ? 35 : index === 0 ? 5 : 20, // Độ rộng cột tùy chỉnh
        }));

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                };
            });
        });

        const titleSell = worksheet.getCell('A1');
        titleSell.value = 'Thông tin yêu cầu'; // Gán giá trị tiêu đề

        if (query.time_from && query.time_to) {
            const timeQuerySell = worksheet.getCell('J1');
            timeQuerySell.value = `Từ ${StringUtils.formatDateString(String(query.time_from))} Đến ${StringUtils.formatDateString(String(query.time_to))}`; // Gán giá trị tiêu đề
        }
        // Gửi file về client
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', 'attachment; filename="updated-file.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    }
}
