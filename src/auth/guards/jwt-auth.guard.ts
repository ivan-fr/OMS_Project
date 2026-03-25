import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Format attendu: Bearer <token>
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.substring(7);

    try {
      request.user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super_secret_key_for_jwt',
      });
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
