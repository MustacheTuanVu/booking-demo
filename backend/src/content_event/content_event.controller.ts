import { Content_eventService } from './content_event.service';
import { Control } from "src/common/meta/control.meta";

@Control('content_event')
export class Content_eventController {
    constructor(private readonly _content_eventService: Content_eventService, ){}
}

