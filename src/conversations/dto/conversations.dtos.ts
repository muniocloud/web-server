import { JWTPayload } from 'src/auth/type';
import { ConversationMessage, ConversationStatus } from '../type';
import { Socket } from 'socket.io';

export type CreateConversationInput = {
  level: number;
  context: string;
};

export type CreateConversationRepositoryInput = {
  level: number;
  context: string;
  title: string;
  messages: Omit<ConversationMessage, 'id'>[];
  status: ConversationStatus;
};

export type GetConversationInput = {
  id: number;
};

export type SetupConversationInput = {
  id: number;
};

export type GetNextMessageInput = {
  conversationId: number;
};

export type HandleNextMessageInput = {
  conversationId: number;
};

export type FinishConversationInput = {
  conversationId: number;
};

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

export type GetConversationRepositoryInput = {
  id: number;
};

export type UpdateConversationRepositoryInput = {
  id: number;
  title?: string;
  status?: ConversationStatus;
  feedback?: string;
  rating?: number;
};

export type AddConversationMessageResponseRepositoryInput = {
  conversationMessageId: number;
  feedback: string;
  rating: number;
  audioUrl: string;
};

export type ConversationsContext = {
  user: JWTPayload;
  socket?: Socket;
};
