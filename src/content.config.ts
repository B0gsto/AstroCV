import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const cvCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/cv" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    icon: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
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

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    coverImage: z.string().optional(),
    outcome: z.string().optional(),
    featured: z.boolean().default(false),
    completedDate: z.date(),
  }),
});

export const collections = {
  cv: cvCollection,
  blog: blogCollection,
  projects: projectsCollection,
};
