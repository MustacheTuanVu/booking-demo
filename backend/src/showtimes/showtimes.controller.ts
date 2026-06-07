import { ShowtimesService } from './showtimes.service';
import { Control } from "src/common/meta/control.meta";

@Control('showtimes')
export class ShowtimesController {
    constructor(private readonly _showtimesService: ShowtimesService, ){}
}

