export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  avatar?: Express.Multer.File;
};

export type CreateUserRepositoryInput = {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
};
