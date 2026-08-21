// update-task-status.dto.ts
import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class UpdateTaskStatusDto {
    @IsNotEmpty()
    @IsString()
    taskName: string; // O texto exato da tarefa para buscar no MD

    @IsNotEmpty()
    @IsIn(['[x]', '[/]', '[ ]'])
    newStatus: string; // [x] Concluído, [/] Parcial, [ ] Não iniciado
}

// changelog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChangelogService {
    private readonly filePath = path.join(process.cwd(), '../changelog.md');
    private readonly logPath = path.join(process.cwd(), '../changelog-activity.json');

    // Lê e agrupa as tarefas por status (Passado, Presente, Futuro)
    getGroupedChangelog() {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const lines = fileContent.split('\n');
        const grouped = {
            passado: [],     // [x]
            presente: [],    // [/] ou [>]
            futuro: [],      // [ ]
        };
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('- [x]')) {
                grouped.passado.push(trimmedLine.replace('- [x]', '').trim());
            } else if (trimmedLine.includes('- [/]') || trimmedLine.includes('- [>]')) {
                grouped.presente.push(trimmedLine.replace('- [/]', '').replace('- [>]', '').trim());
            } else if (trimmedLine.includes('- [ ]')) {
                grouped.futuro.push(trimmedLine.replace('- [ ]', '').trim());
            }
        });
        return grouped;
    }

    // Atualiza o status no arquivo MD e gera o log
    updateTaskStatus(taskName: string, newStatus: string, userId: string) {
        let fileContent = fs.readFileSync(this.filePath, 'utf-8');

        // Escapa caracteres especiais do nome da tarefa para o Regex
        const escapedTaskName = taskName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(`- \\[.*?\\]\\s*${escapedTaskName}`, 'g');

        if (!regex.test(fileContent)) {
            throw new NotFoundException(`Tarefa '${taskName}' não encontrada no changelog.`);
        }

        // Identifica o status antigo para o log
        const match = fileContent.match(regex)[0];
        const oldStatusMatch = match.match(/- \[(.*?)\]/);
        const oldStatus = oldStatusMatch ? `[${oldStatusMatch[1]}]` : 'desconhecido';

        // Substitui pelo novo status
        fileContent = fileContent.replace(regex, `- ${newStatus} ${taskName}`);
        fs.writeFileSync(this.filePath, fileContent, 'utf-8');

        // Registra a atividade
        this.logActivity(userId, taskName, oldStatus, newStatus);

        return { message: 'Status atualizado com sucesso', task: taskName, newStatus };
    }

    // Mantém um histórico de quem alterou o quê e quando
    private logActivity(userId: string, taskName: string, oldStatus: string, newStatus: string) {
        const logEntry = {
            userId,
            taskName,
            oldStatus,
            newStatus,
            timestamp: new Date().toISOString(),
        };

        let logs = [];
        if (fs.existsSync(this.logPath)) {
            const fileData = fs.readFileSync(this.logPath, 'utf-8');
            logs = JSON.parse(fileData || '[]');
        }

        logs.push(logEntry);
        fs.writeFileSync(this.logPath, JSON.stringify(logs, null, 2), 'utf-8');
    }

    // Retorna o log de atividades
    getActivityLogs() {
        if (!fs.existsSync(this.logPath)) return [];
        return JSON.parse(fs.readFileSync(this.logPath, 'utf-8'));
    }
}