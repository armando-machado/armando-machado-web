import { createFileRoute, Link } from "@tanstack/react-router";
import { useLanguage, PageHeading, ContactBand, Process, Materials } from "@/components/site";
import { content, pageMeta } from "@/lib/site-content";

export const Route = createFileRoute("/services/")({
  head: ({ match }) =>
    pageMeta(
      "/services",
      "pt",
      "Cozinhas e roupeiros por medida em Odivelas, Loures e Lisboa",
      "Fabrico próprio de cozinhas, armários e móveis por medida em Odivelas, para Loures, Lisboa e toda a Grande Lisboa. Do desenho à instalação.",
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
