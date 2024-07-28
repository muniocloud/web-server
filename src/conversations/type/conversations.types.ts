import { z } from 'zod';
import { conversationWsSendMessage, conversationWsSetup } from '../validator';

export type ConversationStatus = 'created' | 'started' | 'finished';

export type Conversation = {
  id: number;
  title: string;
  status: ConversationStatus;
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

export type ConversationSetupInput = z.infer<typeof conversationWsSetup>;

export type ConversationSendMessageInput = z.infer<
  typeof conversationWsSendMessage
>;
