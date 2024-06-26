import { Body, Controller, Post, Req, Res, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { LoginDto, SignupDto, loginPayloadSchema, signupPayloadSchema } from './auth.schema';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AllowUnauthorizedRequest } from 'src/utils/allowUnauthorizedRequest';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private authervice: AuthService) { }
    @Post('login')
    @AllowUnauthorizedRequest()
    @UsePipes(new ZodValidationPipe(loginPayloadSchema))
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
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
            throw error;
        }
    }

    @Post('signup')
    @AllowUnauthorizedRequest()
    @UsePipes(new ZodValidationPipe(signupPayloadSchema))
    async signUp(@Body() signupDto: SignupDto) {
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
            throw error;
        }
    }

    @Post('logout')
    async logout(@Req() req: Request & { user: Partial<User> }) {
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
            throw error;
        }
    }
}
