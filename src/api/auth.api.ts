import { ApiError, mockRequest } from './client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountId: string;
  eTopupBalance: number;
  momoBalance: number;
  hasETopup: boolean;
  hasMoMo: boolean;
}

interface Credential {
  password: string;
  user: AuthUser;
}

const DB: Record<string, Credential> = {
  demo: {
    password: 'demo1234',
    user: {
      id: 'USR-001',
      name: 'John Mensah',
      email: 'john.mensah@business.com',
      phone: '0244 123 456',
      accountId: 'ACC-2024-1234',
      eTopupBalance: 480.50,
      momoBalance: 1250.00,
      hasETopup: true,
      hasMoMo: true,
    },
  },
};

export async function apiLogin(username: string, password: string): Promise<AuthUser> {
  return mockRequest(() => {
    const record = DB[username.toLowerCase().trim()];
    if (!record || record.password !== password) {
      throw new ApiError(401, 'Invalid username or password.');
    }
    return { ...record.user };
  });
}

export async function apiVerifyPassword(userId: string, password: string): Promise<boolean> {
  return mockRequest(() => {
    const record = Object.values(DB).find(r => r.user.id === userId);
    return record?.password === password;
  });
}

export async function apiChangePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  return mockRequest(() => {
    const entry = Object.entries(DB).find(([, r]) => r.user.id === userId);
    if (!entry) throw new ApiError(404, 'User not found.');
    if (entry[1].password !== oldPassword) throw new ApiError(401, 'Current password is incorrect.');
    DB[entry[0]].password = newPassword;
  });
}

export async function apiUpdateUser(
  userId: string,
  data: Partial<Pick<AuthUser, 'name' | 'phone' | 'email'>>,
): Promise<AuthUser> {
  return mockRequest(() => {
    const entry = Object.entries(DB).find(([, r]) => r.user.id === userId);
    if (!entry) throw new ApiError(404, 'User not found.');
    Object.assign(DB[entry[0]].user, data);
    return { ...DB[entry[0]].user };
  });
}
