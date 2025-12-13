"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
let AppController = class AppController {
    root() {
        return {
            message: 'Hello world!',
        };
    }
    getLoginPage() {
        return {
            year: new Date().getFullYear(),
            title: 'Acesso ao Console'
        };
    }
    getRegisterPage() {
        return {
            year: new Date().getFullYear(),
            title: 'Crie sua conta de desenvolvedor'
        };
    }
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
    getTermsPage() {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        return {
            year: today.getFullYear(),
            updatedAt: formattedDate,
            title: 'Termos de Serviço'
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Render)('index'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "root", null);
__decorate([
    (0, common_1.Get)('login'),
    (0, common_1.Render)('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getLoginPage", null);
__decorate([
    (0, common_1.Get)('register'),
    (0, common_1.Render)('register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRegisterPage", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.Render)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('terms'),
    (0, common_1.Render)('terms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getTermsPage", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map