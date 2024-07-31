import { z } from 'zod';
import { ConversationMessage } from '../conversations.types';
import {
  conversationSendMessage,
  createConversationSchemaValidator,
} from '../validators/conversations.validators';

export type CreateConversationInput = z.infer<
  typeof createConversationSchemaValidator
>;

export type SaveMessageInput = {
  conversationId: number;
  conversationMessageId: number;
  rating: number;
  feedback: string;
  audioUrl: string;
};

export type UploadAudioInput = {
  audio: Buffer;
  mimetype?: string;
};

export type HandleAIMessageProcessingInput = {
  conversationId: number;
  message: ConversationMessage;
};

export type EmitMessageInput = {
  audioUrl: string;
  message: ConversationMessage;
};

export type HandleSendMessageInput = {
  conversationId: number;
  audio: Buffer;
  mimetype: string;
};

export type ConversationSendMessageInput = z.infer<
  typeof conversationSendMessage
>;
