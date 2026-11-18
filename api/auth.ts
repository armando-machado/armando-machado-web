import { CSRF_COOKIE, PROVIDER, clientConfig, popupResponse, requestToken } from "./_github.js";

/** Starts sign-in: sends the user to GitHub with a one-time state value. */
export function GET(request: Request) {
  if (new URL(request.url).searchParams.get("provider") !== PROVIDER) {
    return popupResponse({ error: "Só é possível entrar com o GitHub." });
  }
  const client = clientConfig();
  if (!client) return popupResponse({ error: "A entrada com o GitHub não está configurada." });

  const state = crypto.randomUUID().replaceAll("-", "");
  const params = new URLSearchParams({ client_id: client.id, state });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      "Set-Cookie": `${CSRF_COOKIE}=${state}; HttpOnly; Path=/api; Max-Age=600; SameSite=Lax; Secure`,
    },
  });
}

/** Refreshes an expired token (GitHub App tokens last 8 hours); called same-origin by the CMS. */
export async function POST(request: Request) {
  const params = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const refreshToken = params?.["refresh_token"];
  if (
    params?.["grant_type"] !== "refresh_token" ||
    typeof refreshToken !== "string" ||
    !refreshToken
  ) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const result = await requestToken({ grant_type: "refresh_token", refresh_token: refreshToken });
  if (!result) return Response.json({ error: "token_request_failed" }, { status: 502 });
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
