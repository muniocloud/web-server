import { z } from 'zod';

export const generativeResponseFeedbackSchemaValidator = z.object({
  feedback: z.string(),
  rating: z.number().min(0).max(10),
});

export const generativeResponseFeedbackOverallSchemaValidator = z.string();

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
