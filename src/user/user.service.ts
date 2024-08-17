import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>) { }

    /**
     * Find User Based on Email
     * 
     * @param {string} email 
     * @returns {Promise<User>}
     */
    findUserByEmail(email: string): Promise<User> {
        return this.userRepository.findOneBy({ email });
    }

    /**
     * Create User using given User details
     * 
     * @param {Partial<User>} userDetails 
     * @returns {Promise<User>}
     */
    createUser(userDetails: Partial<User>): Promise<User> {
        return this.userRepository.save(userDetails);
    }
    
    /**
     * Get User details based on User Id
     * 
     * @param {number} userId 
     * @returns {Promise<User>}
     */
    getUserDetails(userId: number): Promise<User> {
        return this.userRepository.findOne({
            where: {
                id: userId
            },
            select: ['id', 'email', 'name', 'profile_image']
        });
    }
}
