import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('register: crée un utilisateur avec mot de passe hashé', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);
    usersServiceMock.create.mockResolvedValue({
      id: 'u1',
      email: 'john@doe.com',
      createdAt: new Date(),
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const result = await service.register({
      email: 'john@doe.com',
      password: 'password123',
    });

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('john@doe.com');
    expect(usersServiceMock.create).toHaveBeenCalledWith({
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
    });
    expect(result.email).toBe('john@doe.com');
  });

  it('register: lève une erreur si email déjà utilisé', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({ id: 'u1' });

    await expect(
      service.register({ email: 'john@doe.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login: lève une erreur si utilisateur introuvable', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'john@doe.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login: lève une erreur si mot de passe invalide', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'john@doe.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login: retourne un token et les infos publiques user', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login({
      email: 'john@doe.com',
      password: 'password123',
    });

    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'john@doe.com',
    });
    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'u1',
        email: 'john@doe.com',
      },
    });
  });
});
