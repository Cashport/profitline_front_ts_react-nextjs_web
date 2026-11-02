import { NextRequest, NextResponse } from "next/server";
import env from "./config";

const LANDING_ROUTES = ["/", "/en"];
const PUBLIC_FILES = ["/robots.txt", "/sitemap.xml", "/llms.txt", "/assets"];
const APP_HOME = "/clientes/all";

export async function middleware(request: NextRequest) {
  // content-security-policy
  const apiHost = process.env.NEXT_PUBLIC_API_HOST?.slice(0, -4) ?? "";
  const apin8nHost = env.API_APPLY_TAB_AI?.slice(0, -45) ?? "";
  const apin8nHost2 = env.API_APPLY_TAB_AI_DEMO?.slice(0, -45) ?? "";
  const apin8nHost3 = env.API_PURCHASE_ORDERS_AI?.slice(0, -45) ?? "";
  const apiChatHost = env.API_CHAT?.slice(0, -4) ?? "";
  const apiChatWsHost = apiChatHost.replace("https://", "wss://").replace("http://", "ws://");
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const unpkgForPDF = "https://unpkg.com";
  const amazonFiles = "https://*.amazonaws.com";
  const azureBlob = "https://*.blob.core.windows.net";
  // Mapa de Visitas: estilo, teselas, fuentes y sprites por fetch, más la telemetría de Mapbox.
  const mapboxHosts = "https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com";
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://checkout.wompi.co ${unpkgForPDF};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' https: data: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' blob: https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://firebase.googleapis.com ${apiHost} ${apin8nHost} ${apin8nHost2} ${apin8nHost3} ${apiChatHost} ${apiChatWsHost} ${amazonFiles} ${mapboxHosts} https://checkout.wompi.co;
    frame-src 'self' https://*.firebaseapp.com https://*.firebaseio.com https://www.gstatic.com https://checkout.wompi.co;
    media-src 'self' blob: ${amazonFiles} ${azureBlob};
    object-src 'none';
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
    worker-src blob: ;
    child-src blob: ;
`;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  // end content-security-policy

  // X-XSS-Protection & Permissions-Policy restricted
  requestHeaders.set("X-XSS-Protection", "1; mode=block");
  requestHeaders.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), gyroscope=()"
  );

  const session = request.cookies.get(process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME ?? "");

  const { pathname } = request.nextUrl;
  const withCsp = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    return res;
  };
  // Todo lo que no es la landing pública queda fuera de los buscadores.
  const noIndex = (res: NextResponse) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  };
  const next = () =>
    withCsp(
      NextResponse.next({
        request: { headers: requestHeaders },
        headers: requestHeaders
      })
    );
  const redirectTo = (path: string) =>
    noIndex(
      withCsp(NextResponse.redirect(new URL(path, request.url), { headers: requestHeaders }))
    );
  const isValidSession = async () => {
    if (!session) return false;
    //Call the API to validate the token
    const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth`, {
      headers: {
        Cookie: `${process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME}=${session.value}`
      }
    });
    if (responseAPI.status !== 200) console.error("Error en la validación del token");
    return responseAPI.status === 200;
  };

  // Archivos públicos de la landing (logos, robots, sitemap, llms.txt).
  if (PUBLIC_FILES.some((file) => pathname === file || pathname.startsWith(`${file}/`))) {
    return next();
  }

  // La landing (/ y /en) es el login: pública e indexable. Con sesión válida
  // se entra directo a la app, como antes.
  if (LANDING_ROUTES.includes(pathname)) {
    if (session && (await isValidSession())) return redirectTo(APP_HOME);
    return next();
  }

  // El login anterior ahora vive en la landing. Se conserva solo para el
  // acceso por enlace externo (?token=, flujo de marketplace / Cetaphil).
  if (pathname === "/auth/login" && !request.nextUrl.searchParams.has("token")) {
    return noIndex(NextResponse.redirect(new URL("/", request.url), 308));
  }

  const noAuthRoutes = ["/auth", "/mobile", "/cetaphil", "/portal-archivos"];
  if (noAuthRoutes.some((route) => pathname.startsWith(route))) {
    return noIndex(next());
  }

  if (!session && pathname === "/comercio/cetaphil") {
    return noIndex(NextResponse.redirect(new URL("/cetaphil", request.url)));
  }
  //Return to the landing login if there is no valid session
  if (!(await isValidSession())) {
    return redirectTo("/");
  }
  return noIndex(next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" }
      ]
    }
  ]
};
