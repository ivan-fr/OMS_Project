import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    controller = new AuthController(authServiceMock as unknown as AuthService);
  });

  it('register: délègue au service', async () => {
    authServiceMock.register.mockResolvedValue({
      id: 'u1',
      email: 'john@doe.com',
    });

    const dto = { email: 'john@doe.com', password: 'password123' };
    const result = await controller.register(dto);

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(result.email).toBe('john@doe.com');
  });

  it('login: délègue au service', async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: 'jwt-token',
      user: { id: 'u1', email: 'john@doe.com' },
    });

    const dto = { email: 'john@doe.com', password: 'password123' };
    const result = await controller.login(dto);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(result.accessToken).toBe('jwt-token');
  });

  it('me: retourne user injecté par le guard', () => {
    const req = { user: { sub: 'u1', email: 'john@doe.com' } };

    expect(controller.me(req)).toEqual({ sub: 'u1', email: 'john@doe.com' });
  });
});
