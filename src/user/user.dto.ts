export type CreateUserInput = {
  name: string;
  avatar?: Express.Multer.File;
};

export type CreateUserRepositoryInput = {
  name: string;
  avatarUrl?: string | null;
};
