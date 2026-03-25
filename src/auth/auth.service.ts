import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
	constructor(private readonly usersService: UsersService) {}

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
}
