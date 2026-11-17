import { loadProjects, projects } from "@/lib/site-content";

const copy = { title: "T", type: "Ty", materials: "M", summary: "S" };
const entry = (over: Record<string, unknown> = {}) => ({
  slug: "a",
  category: "kitchen",
  images: [{ src: "/x.webp", kind: "render" }],
  pt: copy,
  en: copy,
  ...over,
});
const images = { "/x.webp": { src: "/assets/x.webp", width: 10, height: 20 } };

describe("projects from the CMS", () => {
  it("loads the committed projects with real image sizes", () => {
    const oak = projects.find((p) => p.slug === "oak-waterfall");
    expect(oak?.images[0]).toMatchObject({ width: 1024, height: 768, kind: "photo" });
    expect(projects.find((p) => p.slug === "wine-wall")?.images[1]?.kind).toBe("render");
  });

  it("maps image paths to sized assets", () => {
    expect(loadProjects({ projects: [entry()] }, images)[0]?.images[0]).toEqual({
      src: "/assets/x.webp",
      width: 10,
      height: 20,
      kind: "render",
    });
  });

  it.each([
    ["missing image", entry({ images: [{ src: "/gone.webp" }] }), /image not found/],
    ["no images", entry({ images: [] }), /at least one image/],
    ["bad slug", entry({ slug: "Bad Slug" }), /bad slug/],
    ["empty copy", entry({ en: { ...copy, title: " " } }), /a.en.title is empty/],
    ["bad category", entry({ category: "car" }), /unknown category/],
  ])("rejects %s so a bad edit fails the build", (_, bad, error) => {
    expect(() => loadProjects({ projects: [bad] }, images)).toThrow(error);
  });

  it("rejects duplicate slugs", () => {
    expect(() => loadProjects({ projects: [entry(), entry()] }, images)).toThrow(/duplicate/);
  });
});
