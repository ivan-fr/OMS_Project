import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async register(dto: RegisterDto) {
		const existingUser = await this.usersService.findByEmail(dto.email);
		if (existingUser) {
			throw new ConflictException('Email déjà utilisé');
		}

		const passwordHash = await bcrypt.hash(dto.password, 10);
	return this.usersService.create({
			email: dto.email,
			passwordHash,
		});
	}

	async login(dto: LoginDto) {
		const user = await this.usersService.findByEmail(dto.email);
		if (!user) {
			throw new UnauthorizedException('Identifiants invalides');
		}

		const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Identifiants invalides');
		}

		// Payload minimal pour les routes privées.
		const payload = { sub: user.id, email: user.email };

		return {
			accessToken: await this.jwtService.signAsync(payload),
			user: {
				id: user.id,
				email: user.email,
			},
		};
	}
}
