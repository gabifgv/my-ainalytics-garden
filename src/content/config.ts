import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  category: z.enum(['GenAI', 'MLOps', 'Data Architecture']),
  keyword: z.string(),
  id: z.string().optional(),
  status: z.string().optional(),
  author: z.string().optional(),
  excerpt: z.string().optional(),
});

export const collections = {
  garden: defineCollection({ type: 'content', schema: postSchema }),
  drafts: defineCollection({ type: 'content', schema: postSchema.partial() }),
};
