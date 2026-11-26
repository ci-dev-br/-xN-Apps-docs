import { Body, Controller, Get, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserPreferencesService } from "../service/user-preferences.service";

@ApiTags('UserPreferences')
@Controller('UserPreferences')
export class UserPreferencesController {
    constructor(
        private readonly userPreferencesService: UserPreferencesService,
    ) { }

    @Get('My')
    @ApiOperation({ operationId: 'UserPreferencesGetMy' })
    async getMyPreferences(@Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado para consultar preferências.');
        }
        const [items, map] = await Promise.all([
            this.userPreferencesService.getPreferences(userId),
            this.userPreferencesService.getPreferencesMap(userId),
        ]);
        return {
            preferences: items,
            map,
        };
    }

    @Post('My')
    @ApiOperation({ operationId: 'UserPreferencesSetMy' })
    async setMyPreferences(
        @Body() body: { code?: string; value?: any; preferences?: Record<string, any> },
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado para salvar preferências.');
        }
        if (body?.code) {
            const val = typeof body.value === 'string' ? body.value : JSON.stringify(body.value ?? '');
            await this.userPreferencesService.setNewPreference(userId, body.code, val);
        }
        if (body?.preferences && typeof body.preferences === 'object') {
            await this.userPreferencesService.setPreferences(userId, body.preferences);
        }
        const [items, map] = await Promise.all([
            this.userPreferencesService.getPreferences(userId),
            this.userPreferencesService.getPreferencesMap(userId),
        ]);
        return {
            success: true,
            preferences: items,
            map,
        };
    }
}
