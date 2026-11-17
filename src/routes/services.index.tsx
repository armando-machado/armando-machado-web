import { createFileRoute, Link } from "@tanstack/react-router";
import { useLanguage, PageHeading, ContactBand, Process, Materials } from "@/components/site";
import { content, pageMeta } from "@/lib/site-content";

export const Route = createFileRoute("/services/")({
  head: ({ match }) =>
    pageMeta(
      "/services",
      "pt",
      "O que fazemos",
      "Fabrico próprio de cozinhas, armários e móveis por medida em Odivelas. Do desenho à instalação.",
    ),
  component: Services,
});

function Services() {
  const lang = useLanguage();
  const t = content[lang];
  return (
    <main>
      <Materials />
      <Process />
      <ContactBand />
    </main>
  );
}
