import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { LoginDto, SignupDto, loginPayloadSchema, signupPayloadSchema } from './auth.schema';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authervice: AuthService) { }

    @Post()
    @UsePipes(new ZodValidationPipe(loginPayloadSchema))
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
        try {
            const { email, password } = loginDto;

            const { accessToken, userDetails } = await this.authervice.login(email, password);

            // Send response
            response.cookie('access-token', accessToken, {
                expires: new Date(Date.now() + 86400000), // Cookie expiration date (in this case, 1 day)
                secure: true, // Send the cookie only over HTTPS
                httpOnly: true, // The cookie is inaccessible to JavaScript code in the browser
                path: '/', // The path where the cookie is valid (e.g., '/' means it's valid for all routes)
                sameSite: 'none', // Restrict the cookie to same-site requests
                domain: 'localhost'
            });

            response.set('Content-Type', 'application/json'); // Set the response header to JSON

            return {
                status: "success",
                message: 'User logged in successfully',
                data: {
                    email: userDetails.email,
                    profile_image: userDetails.profile_image,
                    name: userDetails.name
                }
            }
        } catch (error) {
            throw error;
        }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(signupPayloadSchema))
    async signUp(@Body() signupDto: SignupDto) {
        try {
            const { email, password, name } = signupDto;

            await this.authervice.signup(email, password, name);

            return {
                status: "success",
                message: 'User signup successfull',
            }
        } catch (error) {
            throw error;
        }
    }
}
