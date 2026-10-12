import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string().optional(),
    role: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { work };
