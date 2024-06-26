import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private userService: UserService, private configService: ConfigService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async login(email: string, password: string) {
        try {
            const userDetails = await this.userService.findUserByEmail(email);

            if(!userDetails) {
                throw new UnauthorizedException();
            }

            const isPasswordCorrect = await bcrypt.compare(password, userDetails.password);

            if (!isPasswordCorrect) {
                throw new UnauthorizedException();
            }
            const payload = { email, sub: userDetails.id, id: userDetails.id }

            const accessToken = this.jwtService.sign(payload,
                {
                    secret: this.configService.get('JWT_SECRET_KEY'),
                    expiresIn: this.configService.get('JWT_TOKEN_EXPIRY')
                }
            );

            return { accessToken, userDetails };
        } catch (error) {
            throw error;
        }
    }

    async signup(email: string, password: string, name: string): Promise<User> {
        try {
            const userDetails = await this.userService.findUserByEmail(email);

            if (userDetails) {
                throw new UnauthorizedException('User with this email already exists')
            }
            const salt = await bcrypt.genSalt(parseInt(this.configService.get('SALT')));
            const hashedPassword = await bcrypt.hash(password, salt);

            // create user
            const response = await this.userService.createUser({
                email,
                password: hashedPassword,
                name
            });

            return response;

        } catch(error) {
            throw error;
        }
    }

    async logout(id: number, token: string) {
        try {
            await this.cacheManager.set(token, `${id}`, this.configService.get('JWT_TOKEN_EXPIRY'));
            return true;
        } catch (error) {
            throw error;
        }
    }
}
