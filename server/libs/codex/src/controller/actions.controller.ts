import { ControllerDaoBase } from "@ci/manager";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('CodeBlock')
@Controller('CodeBlock')
export class ActionController extends ControllerDaoBase<any,> {

}