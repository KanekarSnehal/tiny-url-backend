import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    async getUserDetails(@Req() req: Request & { user: Partial<User> }) {
        try {
            const userId = req.user.id;
            const response = await this.userService.getUserDetails(userId);
            return {
                status: 'success',
                data: response
            }
        } catch (error) {
            throw error;
        }
    }
}
