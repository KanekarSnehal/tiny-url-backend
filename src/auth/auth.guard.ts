import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService, private reflector: Reflector, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    return new Promise<boolean>(async (resolve) => {
      try{
        const request = context.switchToHttp().getRequest();    
        const allowUnauthorizedRequest = this.reflector.get<boolean>('allowUnauthorizedRequest', context.getHandler());
    
        if(allowUnauthorizedRequest) return resolve(true);
    
        const token = request.headers['authorization'];
        
        // check if token is present in request headers
        if (!token) {
          return resolve(false);
        }
        
        // check if logout token is present in cache
        const isLoggedOut = await this.cacheManager.get(`${token}`);
        if(isLoggedOut) return resolve(false);
  
        // verify token
        const jwtToken = token.replace('Bearer', '').trim();
        const decoded = await this.jwtService.verify(jwtToken, { secret: this.configService.get('JWT_SECRET_KEY') });
        
        if(!decoded) return resolve(false);
  
  
        request.user = decoded;
        return resolve(true);
      } catch(error) {
        return resolve(false);
      }

    });
  }
}
