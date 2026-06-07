export class RandomCodeUtils {
    private static readonly chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Bỏ các ký tự dễ nhầm

    static generateUniqueCode(length: number): string {
        let code = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * this.chars.length);
            code += this.chars[randomIndex];
        }
        return code;
    }
}