import { BadRequestException, Body, Controller, Post, Req, Res, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { LoginDto, SignupDto, loginPayloadSchema, signupPayloadSchema } from './auth.schema';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AllowUnauthorizedRequest } from 'src/utils/allowUnauthorizedRequest';
import { User } from 'src/user/user.entity';
import { GenericResponse } from 'src/utils/genericSchema';

@Controller('auth')
export class AuthController {
    constructor(private authervice: AuthService) { }

    /**
     * Authenticates a user with the provided email and password.
     * If successful, sets the `Authorization` header in the response with the JWT token and returns the user details.
     *
     * @param {LoginDto} loginDto - An object containing the user's login credentials (`email` and `password`).
     * @param {Response} response - The HTTP response object where the JWT token is set in the `Authorization` header.
     * @returns {Promise<GenericResponse<{ email: string, profile_image: string, name: string, access_token: string }>>}
     * - Returns a promise that resolves to an object containing the status, a success message, and the user details (email, profile image, name, access token).
     * @throws {BadRequestException} Will throw an error if authentication fails.
     */
    @Post('login')
    @AllowUnauthorizedRequest()
    @UsePipes(new ZodValidationPipe(loginPayloadSchema))
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<GenericResponse<{ email: string; profile_image: string; name: string; access_token: string; }>> {
        try {
            const { email, password } = loginDto;

            const { accessToken, userDetails } = await this.authervice.login(email, password);

            // set token in authorization header
            response.set('Authorization', `Bearer ${accessToken}`);
            
            return {
                status: "success",
                message: 'User logged in successfully',
                data: {
                    email: userDetails.email,
                    profile_image: userDetails.profile_image,
                    name: userDetails.name,
                    access_token: accessToken
                }
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Registers a new user with the provided email, password, and name.
     * If successful, returns the user's email and name.
     *
     * @param {SignupDto} signupDto - An object containing the user's signup information (`email`, `password`, `name`).
     * @returns {Promise<GenericResponse<{ email: string, name: string }>>}
     * - Returns a promise that resolves to an object containing the status, a success message, and the user's email and name.
     * @throws {BadRequestException} Will throw an error if the signup process fails.
     */
    @Post('signup')
    @AllowUnauthorizedRequest()
    @UsePipes(new ZodValidationPipe(signupPayloadSchema))
    async signUp(@Body() signupDto: SignupDto): Promise<GenericResponse<{ email: string; name: string; }>> {
        try {
            const { email, password, name } = signupDto;

            const response = await this.authervice.signup(email, password, name);

            return {
                status: "success",
                message: 'User signup successfull',
                data: {
                    email: response.email,
                    name: response.name
                }
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Logs out the currently authenticated user.
     * Invalidates the user's token and removes their session.
     *
     * @param {Request & { user: Partial<User> }} req - The HTTP request object, including user information and authorization headers.
     * @returns {Promise<GenericResponse>}
     * - Returns a promise that resolves to an object containing the status and a success message.
     * @throws {BadRequestException} Will throw an error if the logout process fails.
     */
    @Post('logout')
    async logout(@Req() req: Request & { user: Partial<User> }): Promise<GenericResponse> {
        try {
            const userId = req.user.id;
            // set token in cache
            const token = req.headers['authorization'];
    
            await this.authervice.logout(userId, token);
    
            return {
                status: "success",
                message: 'User logged out successfully'
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
