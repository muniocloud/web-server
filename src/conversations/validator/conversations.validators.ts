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

export const conversationWsSetup = z.object({
  conversationId: z.number().positive(),
});

export const conversationWsSendMessage = z
  .tuple([
    z.object({
      conversationId: z.number().positive(),
      mimetype: z.string().default('audio/mpeg'),
    }),
    z.instanceof(Buffer),
  ])
  .transform((data) => {
    return {
      audio: data[1],
      conversationId: data[0].conversationId,
      mimetype: data[0].mimetype,
    };
  });

export const generativeResponseFeedbackSchemaValidator = z.object({
  feedback: z.string(),
  rating: z.number().min(0).max(10),
});

export const generativeResponseFeedbackOverallSchemaValidator = z.string();
