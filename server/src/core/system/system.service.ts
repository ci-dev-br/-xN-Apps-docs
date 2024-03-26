import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Status } from "./model/status";
import { cpuUsage, memoryUsage } from 'process';
import { ApiProperty } from "@nestjs/swagger";
import { copyFileSync } from "fs";

export class CPUInfo {
    @ApiProperty({ nullable: true, required: false }) system?: number;
    @ApiProperty({ nullable: true, required: false }) user?: number;
    @ApiProperty({ nullable: true, required: false }) moment?: Date;
    @ApiProperty({ nullable: true, required: false }) heapTotal?: number;
    @ApiProperty({ nullable: true, required: false }) heapUsed?: number;
    @ApiProperty({ nullable: true, required: false }) rss?: number;
    @ApiProperty({ nullable: true, required: false }) external?: number;
}

@Injectable()
export class SystemService {
    private _cpu_cached_history?: CPUInfo[] = [];
    constructor(
        @InjectRepository(Status)
        private readonly statusRepo: Repository<Status>,
    ) {
        this.readCpu();
    }
    private readCpu() {
        const usage = cpuUsage();
        const mem = memoryUsage();
        this._cpu_cached_history.push({
            ...usage, moment: new Date(),
            heapTotal: mem.heapTotal,
            heapUsed: mem.heapUsed,
            rss: mem.rss,
            external: mem.external,
        });
        setTimeout(() => this.readCpu(), 1000);
    }
    async leitura() {
        return await (this._cpu_cached_history = this._cpu_cached_history.slice(-15));
    }
}