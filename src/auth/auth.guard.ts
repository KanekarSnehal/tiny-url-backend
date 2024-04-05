import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService, private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();    
    const allowUnauthorizedRequest = this.reflector.get<boolean>('allowUnauthorizedRequest', context.getHandler());

    if(allowUnauthorizedRequest) return true;

    const token = request.headers['authorization'];

    if (!token) {
      return false;
    }

    // verify token
    try {
      const decoded = this.jwtService.verify(token.replace('Bearer', '').trim(),
        {
          secret: this.configService.get('JWT_SECRET_KEY')
        });

      if(!decoded) return false;
      request.user = decoded;

    } catch (error) {
      console.log("Error in auth guard", error)
      return false;
    }

    return true;
  }
}
