/*
 * "Sign in with GitHub" for the CMS at /admin, adapted from Sveltia CMS
 * Authenticator (MIT, Kohei Yoshino). It runs on this Vercel project because
 * GitHub's login needs a client secret, which cannot live in the public site.
 *
 * Env: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (a GitHub App installed only on
 * this repository, so its tokens cannot touch any other repo).
 */
export const PROVIDER = "github";
export const CSRF_COOKIE = "cms-csrf";

export function clientConfig() {
  const id = process.env["GITHUB_CLIENT_ID"];
  const secret = process.env["GITHUB_CLIENT_SECRET"];
  return id && secret ? { id, secret } : null;
}

/** Exchanges a code or refresh token for a user token, adding the client secret server-side. */
export async function requestToken(params: Record<string, string>) {
  const client = clientConfig();
  if (!client) return null;
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, client_id: client.id, client_secret: client.secret }),
    });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  } catch {
    return null;
  }
}

const serialize = (value: unknown) => JSON.stringify(value ?? null).replaceAll("<", "\\u003c");

/**
 * Popup page that hands the result to the CMS window. The message is only ever
 * posted to this site's own origin, so no other site can receive the token.
 */
export function popupResponse(content: { token?: string; refreshToken?: string; error?: string }) {
  const state = content.error ? "error" : "success";
  const handshake = `authorizing:${PROVIDER}`;
  const message = `authorization:${PROVIDER}:${state}:${JSON.stringify({ provider: PROVIDER, ...content })}`;
  return new Response(
    `<!doctype html><html lang="pt-PT"><body><script>
(() => {
  const handshake = ${serialize(handshake)};
  const message = ${serialize(message)};
  window.addEventListener("message", ({ data, origin }) => {
    if (data === handshake && origin === location.origin) window.opener?.postMessage(message, origin);
  });
  window.opener?.postMessage(handshake, location.origin);
})();
</script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie": `${CSRF_COOKIE}=; HttpOnly; Max-Age=0; Path=/api; SameSite=Lax; Secure`,
      },
    },
  );
}
