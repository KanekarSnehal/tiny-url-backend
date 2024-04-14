import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>) { }

    findUserByEmail(email: string) {
        return this.userRepository.findOneBy({ email });
    }

    createUser(userDetails: Partial<User>) {
        return this.userRepository.save(userDetails);
    }
    
    getUserDetails(userId: number) {
        return this.userRepository.findOne({
            where: {
                id: userId
            },
            select: ['id', 'email', 'name', 'profile_image']
        });
    }
}
