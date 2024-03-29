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

    createUser(userDetails) {
        return this.userRepository.create(userDetails);
    }
}
