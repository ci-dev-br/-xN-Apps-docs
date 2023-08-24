import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrarInputDto } from './dto/dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { User } from '../models/user.entity';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly userService: UserService
  ) { }
  @Post('Registrar')
  @ApiOperation({ operationId: 'Registrar' })
  @ApiResponse({
    type: User
  })
  async registrar(
    @Body() input?: RegistrarInputDto,
  ) {
    const created_user = await this.userService.registrar({
      email: input.email,
      password: input.password,
      username: input.identificacao,
      phone: input.phone
    });
    return created_user;
  }
}
