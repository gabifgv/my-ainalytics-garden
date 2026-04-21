import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  category: z.enum(['GenAI', 'MLOps', 'Data Architecture']),
  keyword: z.string(),
  flower_type: z.enum(['dandelion', 'lavender', 'tulip', 'rose', 'sunflower', 'wheat', 'bamboo', 'coral', 'ginkgo', 'cosmos', 'thistle', 'lotus', 'vine']).optional(),
  id: z.string().optional(),
  status: z.string().optional(),
  author: z.string().optional(),
  excerpt: z.string().optional(),
});

export const collections = {
  garden: defineCollection({ type: 'content', schema: postSchema }),
  drafts: defineCollection({ type: 'content', schema: postSchema.partial() }),
};
