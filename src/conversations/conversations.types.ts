import { z } from 'zod';
import { STATUS } from 'src/common/enums';
import {
  conversationSendMessage,
  conversationSetup,
} from './validators/conversations.getway.validators';

export type Conversation = {
  id: number;
  title: string;
  status: STATUS;
  messages?: ConversationMessage[];
};

export type ConversationMessage = {
  id: number;
  message: string;
  isUser: boolean;
};

export type ConversationMessageResponse = {
  id: number;
  feedback: string;
  rating: number;
  audioUrl: string;
};

export type ConversationSetupInput = z.infer<typeof conversationSetup>;

export type ConversationSendMessageInput = z.infer<
  typeof conversationSendMessage
>;
