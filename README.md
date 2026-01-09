# AstroCV

A modern, performant portfolio and CV website built with Astro.

## Features

- **Zero JavaScript by default** — Ships pure HTML/CSS for instant page loads
- **MDX Blog** — Write posts with embedded components and syntax highlighting
- **Glassmorphism Design** — Modern UI with smooth CSS animations
- **Interactive Skills** — Visual skill bars and experience timeline
- **Downloadable CV** — PDF resume integration
- **Type-Safe Content** — Content Collections with Zod schema validation
- **Fully Responsive** — Optimized for all screen sizes

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Astro 4 |
| Content | MDX + Content Collections |
| Styling | Vanilla CSS with custom properties |
| Language | TypeScript |
| Validation | Zod |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── content/          # MDX content
│   ├── blog/         # Blog posts
│   ├── cv/           # CV sections (about, experience, education, skills)
│   └── projects/     # Project showcases
├── components/       # Astro components
│   ├── blog/         # BlogCard
│   ├── cv/           # Timeline, SkillBar
│   ├── layout/       # Header, Footer
│   └── projects/     # ProjectCard
├── layouts/          # BaseLayout
├── pages/            # Routes
│   ├── blog/         # Blog listing and posts
│   └── projects/     # Projects listing and details
└── styles/           # Global CSS and animations
```

## Content Collections

Content is managed through type-safe Astro Content Collections:

```typescript
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});
```

## Deployment

Built for static hosting. Output is in `./dist/` after running `npm run build`.

Compatible with: Cloudflare Pages, Vercel, Netlify, GitHub Pages, any static host.

## License

MIT
