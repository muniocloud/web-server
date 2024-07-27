export type JWTPayload = {
  id: number;
  email: string;
};

export type User = JWTPayload;
