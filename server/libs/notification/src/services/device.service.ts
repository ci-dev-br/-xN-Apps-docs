import { Injectable } from "@nestjs/common";
import { Equal, Repository } from "typeorm";
import { Device } from "../models/device.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PhoneNumber } from "../notificacao.module";

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repo: Repository<Device>,
        @InjectRepository(Device)
        private readonly phoneNumberRepo: Repository<PhoneNumber>,
    ) { }
    async connect(device?: Device) {
        try {
            return await this.createAndSave(device)
        } catch (error) {
            console.error(Error("Falha"));
        }
    }
    async createAndSave(device?: Device) {
        if (!device) return;
        const device_found = await this.find(device);
        if (device_found) {
            console.log(device_found)
            if (device.numbers) {
                device_found.numbers = [...device.numbers];
                device_found.numbers.forEach(async pn => {
                    try {
                        let phone_number = (await this.phoneNumberRepo.findOne({
                            where: { number: Equal(pn.number) }
                        })) || new PhoneNumber();
                        phone_number.number = pn.number;
                        phone_number.device = device_found;
                        phone_number.createdAt = new Date();
                        await this.phoneNumberRepo.save(phone_number);
                    } catch (error) {
                        console.error(error)
                    }
                })
            }
            await this.repo.save(device_found, { reload: true });
            return device_found;
        } else {
            device = this.repo.create(device);
            return await this.repo.save(device);
        }
    }
    async find(device?: Device) {
        if (!device) return;
        if (device.mac)
            return await this.repo.findOne({ where: { mac: Equal(device.mac) } });
        return null;
    }
}