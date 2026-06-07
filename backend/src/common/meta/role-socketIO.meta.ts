//RolesSocketIOGuard


import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common"
import { RolesSocketIOGuard } from "src/auth/guard/role-socketIO.guard";

export const RolesSKIO = (... role) => {
    return applyDecorators(SetMetadata('roles', role), UseGuards(RolesSocketIOGuard));
}