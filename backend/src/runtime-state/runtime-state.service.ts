import { Injectable, OnModuleDestroy } from '@nestjs/common';

type StoredValue = {
    value: string;
    timer?: NodeJS.Timeout;
};

@Injectable()
export class RuntimeStateService implements OnModuleDestroy {
    private readonly values = new Map<string, StoredValue>();
    private readonly eventSockets = new Map<string, Set<string>>();
    private readonly internalSockets = new Set<string>();

    onModuleDestroy() {
        for (const storedValue of this.values.values()) {
            if (storedValue.timer) {
                clearTimeout(storedValue.timer);
            }
        }
        this.values.clear();
        this.eventSockets.clear();
        this.internalSockets.clear();
    }

    async setPendingOrder(
        orderId: string,
        data: unknown,
        onExpire: () => Promise<void>,
        seconds = 5 * 60,
    ) {
        await this.setData('ORDER', orderId, data, seconds, onExpire);
    }

    async addUserToEvent(eventId: string, socketId: string) {
        const sockets = this.eventSockets.get(eventId) ?? new Set<string>();
        sockets.add(socketId);
        this.eventSockets.set(eventId, sockets);
    }

    async removeUserFromEvent(eventId: string, socketId: string) {
        const sockets = this.eventSockets.get(eventId);
        if (!sockets) {
            return;
        }

        sockets.delete(socketId);
        if (sockets.size === 0) {
            this.eventSockets.delete(eventId);
        }
    }

    async getUsersInEvent(eventId: string): Promise<string[]> {
        return [...(this.eventSockets.get(eventId) ?? [])];
    }

    async deleteAllUserInEvent(eventId: string): Promise<number> {
        return this.eventSockets.delete(eventId) ? 1 : 0;
    }

    async addUserInternal(socketId: string) {
        this.internalSockets.add(socketId);
    }

    async getUsersInternal(): Promise<string[]> {
        return [...this.internalSockets];
    }

    async deleteUserInternal(socketId: string) {
        this.internalSockets.delete(socketId);
    }

    async deleteAllUserInternal(): Promise<number> {
        const hadUsers = this.internalSockets.size > 0;
        this.internalSockets.clear();
        return hadUsers ? 1 : 0;
    }

    async setRegistrationOtp(phone: string, data: unknown, seconds = 5 * 60) {
        await this.setData('REGISTRATION_OTP', phone, data, seconds);
    }

    async getRegistrationOtp(phone: string): Promise<string | null> {
        return this.getData('REGISTRATION_OTP', phone);
    }

    async setData(
        type: string,
        key: string,
        data: unknown,
        seconds?: number,
        onExpire?: () => Promise<void>,
    ) {
        const stateKey = this.createKey(type, key);
        await this.deleteData(type, key);

        const storedValue: StoredValue = {
            value: JSON.stringify(data),
        };

        if (seconds) {
            storedValue.timer = setTimeout(async () => {
                this.values.delete(stateKey);
                if (onExpire) {
                    try {
                        await onExpire();
                    } catch (error) {
                        console.error(`Runtime state expiration failed for ${stateKey}`, error);
                    }
                }
            }, seconds * 1000);
            storedValue.timer.unref();
        }

        this.values.set(stateKey, storedValue);
    }

    async getData(type: string, key: string): Promise<string | null> {
        return this.values.get(this.createKey(type, key))?.value ?? null;
    }

    async deleteData(type: string, key: string) {
        const stateKey = this.createKey(type, key);
        const storedValue = this.values.get(stateKey);
        if (storedValue?.timer) {
            clearTimeout(storedValue.timer);
        }
        this.values.delete(stateKey);
    }

    private createKey(type: string, key: string) {
        return `${type}:${key}`;
    }
}
