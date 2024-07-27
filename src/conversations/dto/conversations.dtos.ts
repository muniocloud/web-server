import { JWTPayload } from 'src/auth/type';
import { ConversationMessage } from '../type';

export type CreateConversationInput = {
  level: number;
  context: string;
};

export type CreateConversationRepositoryInput = {
  level: number;
  context: string;
  title: string;
  messages: ConversationMessage[];
  status: 'created' | 'started';
};

export type ConversationsContext = {
  user: JWTPayload;
};
