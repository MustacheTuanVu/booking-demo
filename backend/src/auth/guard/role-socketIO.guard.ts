import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { MessageCode } from "src/common/exception/MessageCode";
import { Request } from 'express';
import { UsersService } from "src/users/users.service";
import { UserRole } from "src/users/enum/role.enum";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../constants";


@Injectable()
export class RolesSocketIOGuard implements CanActivate {
    private readonly _userService: UsersService;
    private readonly _jwtService: JwtService;


    constructor(private reflector: Reflector, userService: UsersService, jwtService: JwtService) {
        this._userService = userService;
        this._jwtService = jwtService;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const client = context.switchToWs().getClient();
        const token = client.handshake?.headers?.authorization;

        const request = context.switchToHttp().getRequest<Request>();

        const role = this.reflector.get<string[]>('roles', context.getHandler());
        if (!role) {
            return true;
        }
        if (!token) {
            return false;
        }
        console.log(token, role)
        var payload:any;
        try {
            payload = await this._jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            console.log('payload', payload);
            request['user'] = payload;

        } catch {
            throw MessageCode.USER.NOT_FOUND;
        }

        const dataUser: any = await this._userService.findByGoogleId(payload.username);
            if (!role[0].includes(dataUser.role)) {
                throw MessageCode.ROLE.ROLE_IS_NOT_PERMISSION;
            }

        return true;
    }
    handleRequest(err, user, info) {
        return user;
    }
}