import { QueryClient } from "@tanstack/react-query";
import { createRouter, defaultStringifySearch } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
    context: { queryClient },
    // Portuguese is the only language, so ?lang=pt is noise in the URL.
    stringifySearch: (search) => defaultStringifySearch({ ...search, lang: undefined }),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
