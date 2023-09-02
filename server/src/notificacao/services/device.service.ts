import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Device } from "../models/device.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repo: Repository<Device>,
    ) { }
    async connect(device?: Device) {
        if (device?.id) {
            await this.createAndSave(device)
        }
        return device;
    }
    async createAndSave(device?: Device) {
        if (!device) return;
        device = this.repo.create(device);
        return await this.repo.save(device);
    }
}