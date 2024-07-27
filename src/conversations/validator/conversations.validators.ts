import { z } from 'zod';

export const createConversationSchemaValidator = z.object({
  level: z.number().min(1).max(3),
  context: z.enum([
    'routine',
    'cinema',
    'school',
    'hobbies',
    'travel',
    'work',
    'shopping',
    'social life',
    'health & wellness',
    'family life',
    'dining out',
  ]),
});

export const conversationMessagesSchema = z
  .array(
    z.object({
      message: z.string().min(2),
      isUser: z.boolean(),
    }),
  )
  .refine((messages) => {
    const hasInvalidSequence = messages.some((message, index, array) => {
      if (!array[index - 1]) {
        return false;
      }

      return message.isUser === array[index - 1].isUser;
    });

    return !hasInvalidSequence;
  });
