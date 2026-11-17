## Git

- Avoid rewriting published git history (force pushing, or rebasing/amending/squashing commits that are already pushed), and keep the `main` branch deployable: pushes to `main` publish the site.

## Website architecture

- Use shared site chrome and presentation sections in `src/components/site.tsx` with separate content routes, so all pages share the brand identity without duplicating navigation.
- The site is European Portuguese only. Keep site copy in `src/lib/site-content.ts`; projects live in `src/content/projects.json` and are edited by the company through the CMS at `/admin` (`public/admin/config.yml`), so keep that file's format and the CMS fields in sync.
- Distinguish generated inspirational imagery from real portfolio photographs; project entries use photographs from the original brand site, so generated imagery is never presented as completed work.
