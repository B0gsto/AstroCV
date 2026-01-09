import { defineCollection, z } from 'astro:content';

// CV Collection - secțiuni separate pentru flexibilitate
const cvCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        order: z.number(),
        icon: z.string().optional(),
    }),
});

// Blog Collection
const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.date(),
        updatedDate: z.date().optional(),
        tags: z.array(z.string()),
        coverImage: z.string().optional(),
        draft: z.boolean().default(false),
    }),
});

// Projects Collection
const projectsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
        githubUrl: z.string().url().optional(),
        liveUrl: z.string().url().optional(),
        coverImage: z.string().optional(),
        featured: z.boolean().default(false),
        completedDate: z.date(),
    }),
});

export const collections = {
    cv: cvCollection,
    blog: blogCollection,
    projects: projectsCollection,
};
