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
        @InjectRepository(PhoneNumber)
        private readonly phoneNumberRepo: Repository<PhoneNumber>,
    ) { }
    async connect(device?: Device) {
        try {
            return await this.createAndSave(device)
        } catch (error) {
            console.error(new Error("Falha"), error);
        }
    }
    async createAndSave(device?: Device) {
        if (!device) return;
        const numbers = device.numbers;
        const device_found = await this.find(device);
        if (device_found) {
            await this.repo.save(device_found, { reload: true });
            device = device_found;
        } else {
            device = this.repo.create(device);
            device = await this.repo.save(device);
        }
        if (numbers) {
            device_found.numbers = [...numbers];
            device_found.numbers.forEach(async phoneNumber => {
                try {
                    let phone_number = (await this.phoneNumberRepo.findOne({
                        where: { subscriptionId: phoneNumber.subscriptionId, deviceId: device.id }
                    }));
                    if (!phone_number) {
                        phone_number = this.phoneNumberRepo.create(
                            { ...phoneNumber, deviceId: device.id }
                        );
                    } else {
                        if (!phone_number.subscriptionId && phoneNumber.subscriptionId) phone_number.subscriptionId = phoneNumber.subscriptionId;
                        if (phoneNumber.number) phone_number.number = phoneNumber.number;
                        if (phoneNumber.carrierName) phone_number.carrierName = phoneNumber.carrierName;
                    }
                    await this.phoneNumberRepo.save(phone_number);
                } catch (error) {
                    console.error(error)
                }
            })
        }

        return device;
    }
    async find(device?: Device) {
        if (!device) return;
        if (device.mac)
            return await this.repo.findOne({ where: { mac: Equal(device.mac) } });
        return null;
    }
}