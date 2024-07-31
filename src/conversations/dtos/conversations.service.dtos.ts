import { z } from 'zod';
import { ConversationMessage } from '../conversations.types';
import {
  conversationSendMessage,
  createConversationSchemaValidator,
} from '../validators/conversations.validators';

export type CreateConversationInput = z.infer<
  typeof createConversationSchemaValidator
>;

export type SpeechAndSaveMessageInput = {
  conversationId: number;
  message: ConversationMessage;
};

export type UploadAndSaveMessageInput = {
  conversationId: number;
  conversationMessageId: number;
  audio: Buffer;
  mimetype?: string;
  rating: number;
  feedback: string;
};

export type HandleSendMessageInput = {
  conversationId: number;
  audio: Buffer;
  mimetype: string;
};

export type ConversationSendMessageInput = z.infer<
  typeof conversationSendMessage
>;
