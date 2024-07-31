import { Socket } from 'socket.io';
import { JWTPayload } from 'src/auth/type';

export type ConversationsContext = {
  user: JWTPayload;
  socket?: Socket;
  isController?: boolean;
};
