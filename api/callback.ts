import { CSRF_COOKIE, popupResponse, requestToken } from "./_github.js";

/** GitHub redirects here after the user approves; swaps the one-time code for a token. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookie = request.headers
    .get("cookie")
    ?.match(new RegExp(`\\b${CSRF_COOKIE}=([0-9a-f]{32})\\b`))?.[1];

  if (!code || !state) return popupResponse({ error: "O GitHub não devolveu um código de entrada." });
  if (!cookie || cookie !== state)
    return popupResponse({ error: "A entrada expirou ou foi alterada. Tente novamente." });

  const result = await requestToken({ code });
  const token = result?.body["access_token"];
  if (typeof token !== "string")
    return popupResponse({ error: "Não foi possível entrar com o GitHub. Tente novamente." });

  const refreshToken = result?.body["refresh_token"];
  return popupResponse({ token, ...(typeof refreshToken === "string" ? { refreshToken } : {}) });
}
