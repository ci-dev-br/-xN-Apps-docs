import { Injectable } from "@nestjs/common";
import { Equal, Repository } from "typeorm";
import { Device } from "../models/device.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repo: Repository<Device>,
    ) { }
    async connect(device?: Device) {
        return await this.createAndSave(device)
    }
    async createAndSave(device?: Device) {
        if (!device) return;
        const device_found = await this.find(device);
        if (device_found) return device_found;
        device = this.repo.create(device);
        return await this.repo.save(device);
    }
    async find(device?: Device) {
        if (!device) return;
        if (device.mac)
            return await this.repo.findOne({ where: { mac: Equal(device.mac) } });
        return null;
    }
}