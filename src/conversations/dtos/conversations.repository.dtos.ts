import { ConversationMessage } from '../conversations.types';
import { STATUS } from 'src/common/enums';

export type CreateConversationInput = {
  level: number;
  context: string;
  title: string;
  messages: Omit<ConversationMessage, 'id'>[];
  status: STATUS;
};

export type CreateConversationFeedbackInput = {
  conversationId: number;
  feedback: string;
  rating: number;
};

export type UpdateConversationInput = {
  id: number;
  title?: string;
  status?: STATUS;
  feedback?: string;
  rating?: number;
};

export type AddConversationMessageResponseInput = {
  conversationMessageId: number;
  feedback: string;
  rating: number;
  audioUrl: string;
};
