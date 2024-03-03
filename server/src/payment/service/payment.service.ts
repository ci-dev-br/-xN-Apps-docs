import { Injectable, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "../model/payment.entity";
import { Repository } from "typeorm";

/**
 * 
 *  Payment Service
 * 
 */
@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly userRepo: Repository<Payment>,
    ) { }
    async autorization() { }
    async create() {

    }
}