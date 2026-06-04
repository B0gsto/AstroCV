import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, "") ?? "https://stoicabogdanandrei.com";

  return new Response(
    [`User-agent: *`, `Allow: /`, `Sitemap: ${base}/sitemap-index.xml`, ``].join("\n"),
    { headers: { "Content-Type": "text/plain" } }
  );
};
