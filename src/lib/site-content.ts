import wineWall from "@/assets/projects/wine-wall.webp";
import wineWall3d from "@/assets/projects/wine-wall-3d.webp";
import laundryKitchenDrawing from "@/assets/projects/laundry-kitchen-drawing.webp";
import laundryKitchen3d from "@/assets/projects/laundry-kitchen-3d.webp";
import marbleSwatch from "@/assets/materials/marble.webp";
import oakSwatch from "@/assets/materials/oak.webp";
import walnutSwatch from "@/assets/materials/walnut.webp";
import blackLacquerSwatch from "@/assets/materials/black-lacquer.webp";
import whiteGlossSwatch from "@/assets/materials/white-gloss.webp";
import projectData from "@/content/projects.json";
import { createPageHead } from "@/lib/seo";
import { notFoundContent } from "@/lib/not-found-content";
import type { PublicPath, SeoLanguage } from "@/lib/seo-shared";

export type Language = SeoLanguage;
export const serviceSlugs = ["kitchens", "wardrobes", "furniture", "renovations"] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

/*
 * Facts used across the copy come from the brand's own published website
 * (moveismachado.com: home, about, services and gallery pages) or from the
 * company's photographs. Do not add prices, deadlines, guarantees, founding
 * dates or testimonials until the company confirms them.
 */

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  /** "render" marks a 3D design visual; it must never be shown as finished work. */
  kind: "photo" | "render";
};

export type Project = {
  slug: string;
  category: "kitchen" | "furniture";
  images: readonly ProjectImage[];
  title: string;
  type: string;
  materials: string;
  summary: string;
};

type ImageSize = Omit<ProjectImage, "kind">;

/*
 * Projects are edited by the company through the CMS at /admin, which commits
 * src/content/projects.json and uploads photos to src/content/projects/images.
 * A malformed entry fails the build, so a bad edit never reaches the live site.
 */
export function loadProjects(data: unknown, images: Record<string, ImageSize>): Project[] {
  const list = (data as { projects?: unknown } | null)?.projects;
  if (!Array.isArray(list)) throw new Error("projects.json: missing projects list");
  const text = (value: unknown, where: string) => {
    if (typeof value !== "string" || !value.trim())
      throw new Error(`projects.json: ${where} is empty`);
    return value.trim();
  };
  const seen = new Set<string>();
  return list.map((entry: Record<string, unknown>, i) => {
    const slug = text(entry["slug"], `project ${i + 1} slug`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      throw new Error(`projects.json: bad slug "${slug}"`);
    if (seen.has(slug)) throw new Error(`projects.json: duplicate slug "${slug}"`);
    seen.add(slug);
    const category = entry["category"];
    if (category !== "kitchen" && category !== "furniture") {
      throw new Error(`projects.json: ${slug} has unknown category "${String(category)}"`);
    }
    const rawImages = entry["images"];
    if (!Array.isArray(rawImages) || rawImages.length === 0) {
      throw new Error(`projects.json: ${slug} needs at least one image`);
    }
    return {
      slug,
      category,
      images: rawImages.map((image: Record<string, unknown>) => {
        const size = images[String(image["src"])];
        if (!size)
          throw new Error(`projects.json: ${slug} image not found: ${String(image["src"])}`);
        return { ...size, kind: image["kind"] === "render" ? "render" : "photo" } as const;
      }),
      title: text(entry["title"], `${slug}.title`),
      type: text(entry["type"], `${slug}.type`),
      materials: text(entry["materials"], `${slug}.materials`),
      summary: text(entry["summary"], `${slug}.summary`),
    };
  });
}

export const projects: readonly Project[] = loadProjects(
  projectData,
  import.meta.glob<ImageSize>("/src/content/projects/images/*.webp", {
    eager: true,
    query: "?size",
    import: "default",
  }),
);

/*
 * Section images on the home and about pages, taken from the CMS projects in their
 * CMS order, so a project removed in the CMS also disappears there. Renders are skipped.
 */
export const projectCovers = projects.flatMap((p) => {
  const photo = p.images.find((image) => image.kind === "photo");
  return photo ? [{ ...photo, title: p.title }] : [];
});
export const coverAt = (i: number) => projectCovers[i % projectCovers.length];

/** Undefined when the company has removed the project in the CMS. */
export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const designToWork = {
  render: { src: wineWall3d, width: 1600, height: 1132 },
  photo: { src: wineWall, width: 1600, height: 1104 },
  processDrawing: { src: laundryKitchenDrawing, width: 1436, height: 939 },
  processRender: { src: laundryKitchen3d, width: 1600, height: 1132 },
};

export const materials = [
  {
    image: walnutSwatch,
    name: "Madeira",
    copy: "Carvalho, nogueira e faia, em maciço ou folheado.",
  },
  {
    image: whiteGlossSwatch,
    name: "MDF lacado",
    copy: "Mate ou alto brilho, na cor que escolher.",
  },
  {
    image: oakSwatch,
    name: "Laminados técnicos",
    copy: "Termolaminados resistentes ao uso diário.",
  },
  {
    image: marbleSwatch,
    name: "Pedra e cerâmica técnica",
    copy: "Bancadas e revestimentos de veio contínuo.",
  },
  {
    image: blackLacquerSwatch,
    name: "Ferragens e acabamentos",
    copy: "Fecho suave, puxador integrado ou sem puxador.",
  },
] as const;

/** The site is European Portuguese only; old ?lang=en links get the Portuguese page. */
export function resolveLanguage(_value: unknown): Language {
  return "pt";
}

export const content = {
  pt: {
    notFound: notFoundContent.pt,
    nav: ["Início", "O que fazemos", "Projetos", "Sobre nós", "Contactos"],
    quote: "Pedir orçamento",
    tagline: "Feito para o seu espaço",
    heroLabel: "FABRICO PRÓPRIO EM ODIVELAS",
    heroTitle: "Cozinhas para a sua casa.",
    heroItalic: "Feitas á sua medida.",
    heroDescription:
      "Há mais de 40 anos que desenhamos, fabricamos e instalamos cozinhas, armários e móveis por medida em Odivelas e na Grande Lisboa. Também fazemos remodelações completas.",
    heroPrimary: "Pedir orçamento gratuito",
    explore: "Ver projetos",
    heroImageLabel: "Projeto real Armando Machado",
    trust: [
      "Há mais de 40 anos no mercado",
      "Projeto 3D sem custos",
      "Fabrico próprio em Odivelas",
      "Instalação e pós-venda",
    ],
    servicesLabel: "O QUE FAZEMOS",
    servicesTitle: "Feito à medida, do chão ao teto.",
    servicesLink: "Ver todos os serviços",
    services: ["Cozinhas por medida", "Armários por medida", "Móveis por medida", "Remodelações"],
    serviceShort: [
      "Cozinhas desenhadas ao centímetro, com eletrodomésticos encastrados e ferragens de fecho suave.",
      "Armários do chão ao teto, com o interior organizado para o que guarda.",
      "Móveis de sala, escritórios, garrafeiras e portas interiores feitos para o seu espaço.",
      "Remodelações completas de casas e espaços, do projeto à obra acabada.",
    ],
    serviceLong: [
      "Desenhamos cada cozinha a partir das medidas reais da sua casa e da forma como cozinha. Estruturas reforçadas, ferragens de fecho suave, eletrodomésticos encastrados e acabamentos à escolha.",
      "Armários que vão do chão ao teto, contornam paredes irregulares e organizam o interior com prateleiras, gavetas e divisórias na proporção certa.",
      "Móveis de sala, estantes, escritórios, garrafeiras e portas interiores, desenhados para o lugar onde vão ficar.",
      "Fazemos remodelações em geral, de uma divisão à casa inteira, com a mesma equipa que desenha e fabrica os seus móveis.",
    ],
    projectsLabel: "PROJETOS REAIS",
    projectsTitle: "Os nossos trabalhos",
    projectsLink: "Ver todos os projetos",
    projectView: "Ver projeto",
    renderLabel: "Projeto 3D",
    drawingLabel: "Desenho técnico",
    photoLabel: "Obra concluída",
    designLabel: "DO PROJETO 3D À OBRA",
    designTitle: "Veja o seu móvel antes de ele existir.",
    designCopy:
      "Antes de cortarmos a primeira peça, preparamos o projeto em 3D. Escolha materiais, ajuste medidas e aprove o desenho com tranquilidade. Depois, a fábrica faz exatamente o que aprovou.",
    designRenderCaption: "Projeto 3D",
    designPhotoCaption: "Instalação",
    storyLabel: "SOBRE ARMANDO MACHADO",
    storyTitle: "Uma fábrica, mais de 40 anos de cozinhas.",
    storyCopy:
      "Há mais de quatro décadas que fazemos cozinhas, armários e móveis por medida em Odivelas. Ao longo desse tempo apurámos um método: rigor técnico, materiais escolhidos com critério e uma construção pensada para durar.",
    storyCopy2:
      "Como fabricamos tudo, controlamos cada medida, cada união, cada ferragem e cada acabamento. Quem desenha a sua cozinha fala com quem a fabrica e com quem a monta, e é isso que faz a diferença quando ela chega à sua casa.",
    storyLink: "Conheça a nossa história",
    stats: [
      { value: "40+", label: "anos de mercado em Odivelas" },
      { value: "100%", label: "fabrico próprio, peça a peça" },
      { value: "3D", label: "projeto aprovado antes de fabricarmos" },
      { value: "1", label: "equipa do desenho à montagem" },
      { value: "0 €", label: "pela visita, medição e orçamento" },
    ],
    valuesLabel: "COMO CONSTRUÍMOS",
    valuesTitle: "Feito para o uso de todos os dias.",
    values: [
      {
        title: "Estrutura estável",
        copy: "Caixas reforçadas e uniões bem feitas para armários que não cedem com o peso nem com os anos.",
      },
      {
        title: "Precisão",
        copy: "Medidas tiradas no local e cortes feitos na nossa fábrica, para que tudo encaixe à primeira.",
      },
      {
        title: "Acabamentos cuidados",
        copy: "Lacados, madeiras e pedras escolhidos consigo e aplicados com atenção ao detalhe.",
      },
      {
        title: "Acompanhamento",
        copy: "Do primeiro desenho à montagem e depois dela, com assistência pós-venda.",
      },
    ],
    materialsLabel: "MATERIAIS",
    materialsTitle: "Materiais que escolhemos consigo.",
    materialsIntro: "Amostras retiradas de cozinhas que fabricámos.",
    processLabel: "COMO TRABALHAMOS",
    processTitle: "Quatro passos, uma só equipa.",
    steps: ["Visita", "Projeto 3D e orçamento", "Fabrico", "Instalação"],
    stepCopy: [
      "Vamos à sua casa, tiramos medidas e ouvimos o que precisa. Deslocação sem custos.",
      "Desenhamos em 3D, escolhemos materiais consigo e apresentamos um orçamento detalhado.",
      "Produzimos cada peça em Odivelas, com controlo total sobre medidas e acabamentos.",
      "A nossa equipa monta e ajusta tudo, e continua disponível depois da entrega.",
    ],
    processCaption: "Projeto 3D preparado antes do fabrico",
    processDrawingCaption: "Desenho técnico com as medidas da cozinha antes do fabrico",
    ctaLabel: "ORÇAMENTO SEM COMPROMISSO",
    ctaTitle: "Fale-nos do seu projeto.",
    ctaCopy:
      "Diga-nos o que quer fazer e onde. Se tiver medidas ou fotografias do espaço, envie-as: marcamos a visita e preparamos o projeto 3D sem custos.",
    talk: "Pedir orçamento",
    footerCopy:
      "Cozinhas, armários e móveis por medida, com fabrico próprio em Odivelas há mais de 40 anos.",
    find: "Encontre-nos",
    contactsHeading: "Contactos",
    directions: "Como chegar",
    rights: "Todos os direitos reservados.",
    contactWaysTitle: "Fale connosco",
    phoneLabel: "Telefone",
    mobileLabel: "Telemóvel",
    emailLabel: "Email",
    whatsapp: "Falar pelo WhatsApp",
    contactSub: "Odivelas e Grande Lisboa",
    contactCopy:
      "Trabalhamos sobretudo em Lisboa, Odivelas e nos concelhos vizinhos. Diga-nos onde é o projeto e agendamos a deslocação.",
    nextTitle: "O que acontece a seguir",
    nextSteps: [
      "Envie-nos medidas aproximadas, fotografias e referências do que gosta.",
      "Marcamos uma visita para medir o espaço e conversar consigo.",
      "Receba o projeto 3D e o orçamento detalhado, sem compromisso.",
    ],
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "Quanto custa o orçamento?",
        a: "A visita, a medição, o projeto 3D e o orçamento não têm custos nem compromisso.",
      },
      {
        q: "Como preparo o meu projeto?",
        a: "Reúna medidas aproximadas, fotografias do espaço e imagens de cozinhas ou móveis de que goste. Com isso conseguimos começar a conversa.",
      },
      {
        q: "Que materiais posso escolher?",
        a: "Madeira maciça de carvalho, nogueira ou faia, MDF lacado mate ou alto brilho, termolaminados, pedra natural e cerâmica técnica.",
      },
      {
        q: "Quanto tempo demora?",
        a: "Depende da dimensão do projeto, dos materiais e do estado do espaço. Indicamos o prazo junto com o orçamento.",
      },
    ],
    close: "Fechar fotografia",
    previous: "Fotografia anterior",
    next: "Fotografia seguinte",
    projectIntro:
      "Cozinhas e mobiliário fabricados com a nossa fábrica e instalados em casas da Grande Lisboa. Selecione um projeto para ver todas as imagens.",
    projectsCount: "projetos",
    serviceIntro:
      "Cozinhas, armários e móveis por medida, desenhados em 3D, fabricados com a nossa fábrica e instalados pela nossa equipa.",
    serviceExplore: "Conhecer o serviço",
    serviceMaterialsTitle: "Algumas das nossas opções",
    aboutLabel: "SOBRE NÓS",
    aboutTitle: "Mais de 40 anos a fazer móveis por medida.",
    aboutIntro:
      "Em Odivelas, uma equipa que desenha, fabrica e instala, e clientes em toda a Grande Lisboa.",
  },
};

export const cookieConsentContent: Record<
  Language,
  {
    bannerTitle: string;
    bannerDescription: string;
    reject: string;
    accept: string;
    customize: string;
    save: string;
    close: string;
    preferencesTitle: string;
    preferencesDescription: string;
    necessaryTitle: string;
    necessaryDescription: string;
    alwaysActive: string;
    externalMediaTitle: string;
    externalMediaDescription: string;
    manage: string;
    policyLink: string;
    mapTitle: string;
    mapDescription: string;
    loadMap: string;
  }
> = {
  pt: {
    bannerTitle: "Valorizamos a sua privacidade",
    bannerDescription:
      'Usamos apenas o armazenamento necessário para guardar a sua escolha. Conteúdo externo, como o mapa Google, só é carregado se clicar em "Aceitar tudo" ou o ativar em Personalizar.',
    reject: "Rejeitar",
    accept: "Aceitar tudo",
    customize: "Personalizar",
    save: "Guardar escolhas",
    close: "Fechar preferências",
    preferencesTitle: "Preferências de privacidade",
    preferencesDescription:
      "Escolha que recursos opcionais podem funcionar. Pode alterar esta decisão a qualquer momento no rodapé.",
    necessaryTitle: "Armazenamento necessário",
    necessaryDescription:
      "Guarda a versão, as categorias e a data da sua escolha para que o site a respeite nas visitas seguintes.",
    alwaysActive: "Sempre ativo",
    externalMediaTitle: "Conteúdo externo",
    externalMediaDescription:
      "Permite carregar o mapa Google incorporado. Sem esta opção, a morada e a ligação externa continuam disponíveis.",
    manage: "Gerir cookies",
    policyLink: "Política de Cookies",
    mapTitle: "Mapa não carregado",
    mapDescription:
      "O mapa Google é conteúdo externo e pode receber dados técnicos do seu dispositivo. Pode carregá-lo agora ou abrir apenas as direções numa nova página.",
    loadMap: "Carregar mapa",
  },
};

export const cookiePolicyContent: Record<
  Language,
  {
    metaTitle: string;
    metaDescription: string;
    label: string;
    title: string;
    intro: string;
    updated: string;
    sections: readonly { title: string; paragraphs: readonly string[] }[];
    inventoryTitle: string;
    inventory: readonly {
      name: string;
      provider: string;
      purpose: string;
      duration: string;
      category: string;
    }[];
    inventoryLabels: {
      name: string;
      provider: string;
      purpose: string;
      duration: string;
      category: string;
    };
  }
> = {
  pt: {
    metaTitle: "Política de Cookies",
    metaDescription:
      "Saiba que informação Armando Machado guarda no seu dispositivo, quando é usado o Google Maps e como pode alterar a sua escolha.",
    label: "PRIVACIDADE",
    title: "Política de Cookies.",
    intro:
      "Este site não usa cookies de publicidade nem de estatísticas. Guardamos apenas a sua escolha de privacidade e só carregamos o mapa Google se o autorizar.",
    updated: "Última atualização: 9 de novembro de 2026",
    sections: [
      {
        title: "O que usamos",
        paragraphs: [
          "Para funcionar, o site guarda no seu browser um único registo com a escolha que fez no aviso de cookies. Este registo não inclui o seu nome, email ou qualquer identificador de publicidade.",
          "Não usamos ferramentas de estatísticas, pixels de redes sociais nem publicidade.",
        ],
      },
      {
        title: "Mapa Google",
        paragraphs: [
          "O mapa da página de contactos é fornecido pela Google e só é carregado se aceitar o conteúdo externo ou carregar em “Carregar mapa”. Nessa altura a Google pode recolher dados técnicos do seu dispositivo, como o endereço IP, e guardar cookies próprios de acordo com a política de privacidade da Google.",
          "Se preferir não carregar o mapa, a morada continua visível e a ligação “Como chegar” abre o Google Maps numa nova página.",
        ],
      },
      {
        title: "Ligações externas",
        paragraphs: [
          "Ao abrir o Google Maps ou o WhatsApp a partir deste site, passa a utilizar diretamente esses serviços, e aplicam-se as políticas de privacidade de cada um.",
        ],
      },
      {
        title: "Como alterar a sua escolha",
        paragraphs: [
          "Pode aceitar, rejeitar ou alterar a sua escolha a qualquer momento em “Gerir cookies”, no rodapé de todas as páginas. A escolha é válida durante seis meses; depois disso, ou se esta política mudar, voltamos a perguntar.",
        ],
      },
    ],
    inventoryTitle: "Resumo",
    inventoryLabels: {
      name: "O quê",
      provider: "Fornecedor",
      purpose: "Para quê",
      duration: "Duração",
      category: "Categoria",
    },
    inventory: [
      {
        name: "Escolha de cookies (armazenamento local)",
        provider: "Armando Machado",
        purpose: "Lembrar a escolha que fez no aviso de cookies.",
        duration: "Seis meses, ou até apagar os dados do browser.",
        category: "Necessário",
      },
      {
        name: "Mapa Google",
        provider: "Google",
        purpose: "Mostrar a localização da loja num mapa interativo.",
        duration: "Definida pela Google. Só é usado depois de o autorizar.",
        category: "Conteúdo externo",
      },
    ],
  },
};

/* Phone, WhatsApp and email confirmed by the site owner (2026-11-09). */
export const contactDetails = {
  phoneDisplay: "+351 219 311 148",
  phoneHref: "tel:+351219311148",
  email: "moveismachado@hotmail.com",
  mobileDisplay: "+351 964 035 260",
  mobileHref: "tel:+351964035260",
};
export const whatsappUrl = "https://wa.me/351964035260";
/** Opens Google Maps in route mode with the workshop as destination. */
export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=Rua+V%C3%ADtor+Cordon+6A%2C+2675-459+Odivelas%2C+Portugal";
export const mapsEmbedUrl =
  "https://www.google.com/maps?q=Rua+V%C3%ADtor+Cordon+6A,+2675-459+Odivelas,+Portugal&output=embed";
export function pageMeta(path: PublicPath, language: Language, title: string, description: string) {
  return createPageHead({ path, language, title, description });
}
