import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificacaoModule } from './notificacao/notificacao.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './notificacao/models/device.entity';
import { PhoneNumber } from './notificacao/models/phone-number.entity';
import { User } from './auth/models/user.entity';
import { Application } from './auth/models/application.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "127.0.0.1",
      port: 5432,
      username: "notificacao",
      password: "!@#notif48591$",
      database: "@notification",
      synchronize: true,
      entities: [
        Device,
        PhoneNumber,
        User,
        Application,
      ]
    }),
    NotificacaoModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
