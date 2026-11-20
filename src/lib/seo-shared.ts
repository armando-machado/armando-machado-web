import { notFoundContent } from "./not-found-content";

export type SeoLanguage = "pt";

export const DEFAULT_SITE_URL = "https://armandomachado.pt";

export const PUBLIC_PATHS = [
  "/",
  "/services",
  "/projects",
  "/about",
  "/contact",
  "/cookies",
] as const;

export type PublicPath = (typeof PUBLIC_PATHS)[number];

export const SEO_LANGUAGES = ["pt"] as const satisfies readonly SeoLanguage[];

export function resolveSiteUrl(value?: string): string {
  const candidate = value?.trim() || DEFAULT_SITE_URL;
  const url = new URL(candidate);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("VITE_SITE_URL must use http or https");
  }

  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString().replace(/\/$/, "");
}

export function buildLanguageUrl(
  path: PublicPath,
  language: SeoLanguage,
  siteUrl = DEFAULT_SITE_URL,
): string {
  const base = new URL(`${resolveSiteUrl(siteUrl)}/`);
  const basePath = base.pathname.replace(/\/+$/, "");
  const pagePath = path === "/" ? "" : path;

  // Static hosting serves every page as a directory index and redirects
  // "/about" to "/about/", so canonical URLs always end with a slash.
  base.pathname = `${basePath}${pagePath}/`;
  base.search = "";
  return base.toString();
}

export function buildLanguageAlternates(path: PublicPath, siteUrl = DEFAULT_SITE_URL) {
  const portugueseUrl = buildLanguageUrl(path, "pt", siteUrl);

  return [
    { rel: "alternate", hrefLang: "pt-PT", href: portugueseUrl },
    { rel: "alternate", hrefLang: "x-default", href: portugueseUrl },
  ] as const;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createSitemapXml(siteUrl = DEFAULT_SITE_URL): string {
  const entries = PUBLIC_PATHS.flatMap((path) =>
    SEO_LANGUAGES.map((language) => {
      const alternates = buildLanguageAlternates(path, siteUrl)
        .map(
          ({ hrefLang, href }) =>
            `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${escapeXml(href)}" />`,
        )
        .join("\n");

      return [
        "  <url>",
        `    <loc>${escapeXml(buildLanguageUrl(path, language, siteUrl))}</loc>`,
        alternates,
        "  </url>",
      ].join("\n");
    }),
  ).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries,
    "</urlset>",
    "",
  ].join("\n");
}

export function createRobotsTxt(siteUrl = DEFAULT_SITE_URL): string {
  const sitemapUrl = new URL(`${resolveSiteUrl(siteUrl)}/`);
  sitemapUrl.pathname = `${sitemapUrl.pathname.replace(/\/+$/, "")}/sitemap.xml`;

  return [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${sitemapUrl.toString()}`, ``].join("\n");
}

/** Plain-language summary for AI assistants (llmstxt.org). Same facts as the business JSON-LD. */
export function createLlmsTxt(siteUrl = DEFAULT_SITE_URL): string {
  const page = (path: PublicPath) => buildLanguageUrl(path, "pt", siteUrl);

  return `# Armando Machado

> Fabrico próprio de cozinhas, roupeiros e móveis por medida em Odivelas, com projeto 3D, instalação e assistência pós-venda na Grande Lisboa. Mais de 40 anos de experiência.

- Morada: Rua Vítor Cordon 6A, 2675-459 Odivelas, Portugal
- Telefone: +351 219 311 148 · Telemóvel/WhatsApp: +351 964 035 260
- Email: moveismachado@hotmail.com
- Zona de atuação: Lisboa, Odivelas e Grande Lisboa
- Orçamento e projeto 3D gratuitos, com visita ao local

## Serviços

- Cozinhas por medida
- Roupeiros e armários por medida, do chão ao teto
- Móveis por medida: sala, escritório, garrafeiras e portas interiores
- Remodelações completas

## Processo

1. Visita gratuita ao local
2. Projeto 3D e orçamento
3. Fabrico na oficina própria em Odivelas
4. Instalação e assistência pós-venda

## Páginas

- [O que fazemos](${page("/services")}): serviços e materiais
- [Projetos](${page("/projects")}): trabalhos realizados, com fotografias reais
- [Sobre nós](${page("/about")}): a história da empresa
- [Contactos](${page("/contact")}): pedir orçamento
`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function createNotFoundHtml(basePath = "", stylesheetPath = ""): string {
  const prefix = basePath ? `/${basePath.replace(/^\/+|\/+$/g, "")}` : "";
  const stylesheet = stylesheetPath
    ? `<link rel="stylesheet" href="${escapeHtml(stylesheetPath)}">`
    : "";

  return `<!doctype html>
<html lang="pt-PT">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <title>404 | Armando Machado</title>
    ${stylesheet}
  </head>
  <body>
    <main class="not-found-page" id="main-content">
      <div class="not-found-content">
        <p class="not-found-code" aria-hidden="true">404</p>
        <h1 id="not-found-title">${escapeHtml(notFoundContent.pt.title)}</h1>
        <p id="not-found-description">${escapeHtml(notFoundContent.pt.description)}</p>
        <a class="not-found-action" id="not-found-action" href="${prefix}/">${escapeHtml(notFoundContent.pt.action)}</a>
      </div>
    </main>
  </body>
</html>
`;
}

export function getLegacyPortugueseRedirectUrl(requestUrl: string): string | undefined {
  const url = new URL(requestUrl);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (!pathname.endsWith("/pt")) return undefined;

  const deploymentBase = pathname.slice(0, -3);
  url.pathname = deploymentBase ? `${deploymentBase}/` : "/";
  url.search = "";
  url.hash = "";
  return url.toString();
}
