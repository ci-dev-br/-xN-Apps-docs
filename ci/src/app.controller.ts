import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return {
      message: 'Hello world!',
    };
  }


  @Get('login')
  @Render('login') // Renderiza views/login.hbs
  getLoginPage() {
    // Passamos variáveis para o template se necessário
    return {
      year: new Date().getFullYear(),
      title: 'Acesso ao Console'
    };
  }


  @Get('register')
  @Render('register')
  getRegisterPage() {
    return {
      year: new Date().getFullYear(),
      title: 'Crie sua conta de desenvolvedor'
    };
  }

  @Get('dashboard')
  @Render('dashboard')
  getDashboard() {
    return {
      user: { name: 'Dev Lead', avatar: 'DL' },
      systemStatus: {
        uptime: '99.98%',
        latency: '12ms',
        activeModules: 8,
        totalMemory: '64%',
      },
      modules: [
        { name: 'auth-provider-v2', version: '2.1.0', status: 'active', ram: '128MB', uptime: '12d' },
        { name: 'payment-gateway-stripe', version: '1.0.4', status: 'active', ram: '256MB', uptime: '4d' },
        { name: 'notification-service', version: '3.0.1', status: 'warning', ram: '512MB', uptime: '1h' },
        { name: 'legacy-importer', version: '0.9.0', status: 'inactive', ram: '0MB', uptime: '-' },
      ]
    };
  }
}
