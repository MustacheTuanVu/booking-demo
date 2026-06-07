import { Membership_logsService } from './membership_logs.service';
import { Control } from "src/common/meta/control.meta";

@Control('membership_logs')
export class Membership_logsController {
    constructor(private readonly _membership_logsService: Membership_logsService, ){}
}

