import { BadRequestException, Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { GenericResponse } from 'src/utils/genericSchema';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    /**
     * Retrieves a list of TinyURLs created by the authenticated user.
     *
     * @param {Request & { user: Partial<User> }} req - The request object containing the authenticated user information.
     * @returns {Promise<GenericResponse<User>>} An object containing the status and the list of TinyURLs.
     * @throws {BadRequestException} If an error occurs while retrieving the TinyURLs.
     */
    @Get()
    async getUserDetails(@Req() req: Request & { user: Partial<User> }): Promise<GenericResponse<User>> {
        try {
            const userId = req.user.id;
            const response = await this.userService.getUserDetails(userId);
            return {
                status: 'success',
                data: response
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
