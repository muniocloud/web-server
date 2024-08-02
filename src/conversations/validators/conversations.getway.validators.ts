import { z } from 'zod';
import { audioFileValidator } from 'src/common/validators';

export const conversationSetup = z.object({
  conversationId: z.coerce.number().positive(),
});

export const conversationSendMessage = z
  .tuple([
    z.object({
      conversationId: z.coerce.number().positive(),
    }),
    audioFileValidator,
  ])
  .transform((data) => {
    return {
      audio: data[1].buffer,
      mimetype: data[1].mimetype,
      conversationId: data[0].conversationId,
    };
  });
