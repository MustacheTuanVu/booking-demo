import { IMessageCodeData } from "../exception/IMessageCodeData";

export class ResponseModel<T> implements IMessageCodeData {
    code: string;
    message: string;
    status: number;
    data: T;

    constructor(data: T, status: number = 200) {
        this.status = status;

        switch (status) {
            case 200:
                this.code = '200';
                this.message = 'Lấy thành công';
                break;
            case 201:
                this.code = '201';
                this.message = 'Tạo thành công';
                break;
            default:
                this.code = status.toString();
                this.message = 'Success';
                break;
        }

        this.data = data;
    }
}
