import { createFileRoute } from "@tanstack/react-router";
import {
  useLanguage,
  PageHeading,
  Story,
  Values,
  Materials,
  Process,
  ContactBand,
} from "@/components/site";
import { content, pageMeta } from "@/lib/site-content";
export const Route = createFileRoute("/about")({
  head: ({ match }) =>
    pageMeta(
      "/about",
      "pt",
      "A nossa história",
      "Armando Machado: mais de 40 anos de fabrico próprio de cozinhas, armários e móveis por medida em Odivelas.",
    ),
  component: About,
});
function About() {
  const lang = useLanguage();
  const t = content[lang];
  return (
    <main>
      <Story full light />
      <Values />
      <Materials />
      <Process />
      <ContactBand />
    </main>
  );
}
