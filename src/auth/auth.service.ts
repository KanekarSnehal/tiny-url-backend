import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

    /**
     * Handles user login by validating credentials and generating a JWT token.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @returns {Promise<{ accessToken: string, userDetails: User;}>} An object containing the JWT access token and user details.
     * @throws UnauthorizedException if the user is not found or the password is incorrect.
     * @throws BadRequestException if any other error occurs during the login process.
     */
    async login(email: string, password: string): Promise<{ accessToken: string, userDetails: User }> {
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

    /**
     * Registers a new user by creating a user record with hashed password.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @param name - The user's name.
     * @returns {Promise<User>} The created user details.
     * @throws UnauthorizedException if a user with the given email already exists.
     * @throws BadRequestException if any other error occurs during the signup process.
     */
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
            throw error
        }
    }

    /**
     * Logs out the user by storing the token in cache to invalidate it.
     * @param id - The user's ID.
     * @param token - The JWT token to be invalidated.
     * @returns {Promise<boolean>} `true` if logout is successful.
     * @throws BadRequestException if any error occurs during the logout process.
     */
    async logout(id: number, token: string): Promise<boolean> {
        try {
            await this.cacheManager.set(token, `${id}`, this.configService.get('JWT_TOKEN_EXPIRY'));
            return true;
        } catch (error) {
            throw error;
        }
    }
}
