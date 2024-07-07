import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";


@ApiTags('Offer')
@Controller('Offer')
export class OfferController {
    constructor() { }
    async Get() {
    }
    async Sync() {
    }
}