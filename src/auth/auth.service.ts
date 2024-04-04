import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private userService: UserService, private configService: ConfigService) { }

    async login(email: string, password: string) {
        try {
            const userDetails = await this.userService.findUserByEmail(email);

            const isPasswordCorrect = await bcrypt.compare(password, userDetails.password);

            if (!isPasswordCorrect) {
                throw new UnauthorizedException();
            }
            const payload = { email, sub: userDetails.id }

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

    async signup(email: string, password: string, name: string) {
        try {
            const userDetails = await this.userService.findUserByEmail(email);

            if (userDetails) {
                throw new Error('User with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(password, this.configService.get('SALT'));

            // create user
            await this.userService.createUser({
                email,
                password: hashedPassword,
                name
            });

        } catch(error) {
            throw error;
        }
    }
}