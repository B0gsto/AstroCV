import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

// Drafts are visible while developing so they can be reviewed in place,
// and never built into the production site.
export const isVisible = (post: Post) => import.meta.env.DEV || !post.data.draft;

export async function getVisiblePosts(): Promise<Post[]> {
  const posts = await getCollection("blog", isVisible);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export function readingTime(post: Post): string {
  const words = (post.body ?? "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export const postCategory = (post: Post) => post.data.category ?? post.data.tags[0] ?? "Note";
