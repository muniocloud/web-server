import { z } from 'zod';

export * from './conversations.controller.validators';
export * from './conversations.getway.validators';

export const conversationIdSchemaValidator = z.coerce.number().positive();
