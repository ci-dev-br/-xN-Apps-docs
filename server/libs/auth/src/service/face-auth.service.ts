// face-auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';

@Injectable()
export class FaceAuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // 1. Registrar novo usuário com a face
    async register(name: string, descriptor: number[]): Promise<User> {
        const user = this.userRepository.create({ /* name, */ faceDescriptor: descriptor });
        return this.userRepository.save(user);
    }

    // 2. Reconhecer face (Login)
    async recognize(loginDescriptor: number[]): Promise<User | null> {
        const users = await this.userRepository.find();
        let bestMatch: User | null = null;
        let minDistance = 0.6; // Limiar de aceitação

        for (const user of users) {
            if (!user.faceDescriptor) continue;

            const distance = this.euclideanDistance(user.faceDescriptor, loginDescriptor);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = user;
            }
        }
        return bestMatch; // Retorna o usuário se a distância for < 0.6
    }

    private euclideanDistance(desc1: number[], desc2: number[]): number {
        return Math.sqrt(
            desc1.reduce((sum, val, i) => sum + Math.pow(val - desc2[i], 2), 0)
        );
    }
}