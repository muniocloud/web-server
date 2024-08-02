import { STATUS } from 'src/common/enums';

export type Conversation = {
  id: number;
  title: string;
  status: STATUS;
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
