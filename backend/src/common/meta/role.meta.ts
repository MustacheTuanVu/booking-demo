import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common"
import { RolesGuard } from "src/auth/guard/role.guard";

export const Roles = (... role) => {
    return applyDecorators(SetMetadata('roles', role), UseGuards(RolesGuard));
} 