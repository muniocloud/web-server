export type AuthUser = {
  email: string;
  id: number;
  password: string;
  userId: number;
  provider: string;
  providerId?: string;
};

export type CreateAuthUserInput = {
  userId: number;
  email: string;
  password: string;
  provider: string;
};

export type CreateUserAndAuthUserInput = {
  name: string;
  avatar?: Express.Multer.File;
  email: string;
  password: string;
  provider: string;
};
