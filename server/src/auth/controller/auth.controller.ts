import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrarInputDto } from './dto/dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  @Post('Registrar')
  @ApiOperation({ operationId: 'Registrar' })
  async registrar(
    @Body() input?: RegistrarInputDto,
  ) {

  }
}
