import { Controller, Body, Req, Post } from '@nestjs/common';
import { ChangelogService, UpdateTaskStatusDto } from './changelog.service';
import { ApiTags } from '@nestjs/swagger';
import { DetalheFalha } from '@ci/core/system/model/detalhe-falha';
import { Role } from '@ci/auth/decorators/role.decorator';
@ApiTags('changelog')
@Controller('changelog')
export class ChangelogController {
    constructor(private readonly changelogService: ChangelogService) { }
    @Role('DEVELOPER')
    @Post()
    getChangelog() {
        return this.changelogService.getGroupedChangelog();
    }
    @Role('DEVELOPER')
    @Post('logs')
    getActivityLogs() {
        try {
            return this.changelogService.getActivityLogs();
        } catch (error) {
            return new DetalheFalha(error)
        }
    }
    @Role('DEVELOPER')
    @Post('status')
    updateStatus(@Body() updateStatusDto: UpdateTaskStatusDto, @Req() req: any) {
        const userId = req.user?.id || 'usuario_anonimo';
        return this.changelogService.updateTaskStatus(
            updateStatusDto.taskName,
            updateStatusDto.newStatus,
            userId
        );
    }
}