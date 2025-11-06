import { NextRequest, NextResponse } from "next/server";
import env from "./config";

export async function middleware(request: NextRequest) {
  // content-security-policy
  const apiHost = process.env.NEXT_PUBLIC_API_HOST?.slice(0, -4) ?? "";
  const apin8nHost = env.API_APPLY_TAB_AI?.slice(0, -45) ?? "";
  const apin8nHost2 = env.API_APPLY_TAB_AI_DEMO?.slice(0, -45) ?? "";
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://checkout.wompi.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' https://*.amazonaws.com data: blob: https://www.gstatic.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://firebase.googleapis.com ${apiHost} ${apin8nHost} ${apin8nHost2} https://checkout.wompi.co;
    frame-src 'self' https://*.firebaseapp.com https://*.firebaseio.com https://www.gstatic.com https://checkout.wompi.co;
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
  const noAuthRoutes = ["/auth", "/mobile", "/cetaphil"];
  //Return to /login if there is no session cookie
  if (noAuthRoutes.some((route) => pathname.startsWith(route))) {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
      headers: requestHeaders
    });
    res.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    return res;
  }

  if (!session && pathname === "/comercio/cetaphil") {
    return NextResponse.redirect(new URL("/cetaphil", request.url));
  }
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  //Call the API to validate the token
  const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth`, {
    headers: {
      Cookie: `${process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME}=${session?.value}`
    }
  });
  //Return to /login if validation fails
  if (responseAPI.status !== 200) {
    console.error("Error en la validación del token");
    const res = NextResponse.redirect(new URL("/auth/login", request.url), {
      headers: requestHeaders
    });
    res.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    return res;
  }
  if (request.nextUrl.pathname === "/") {
    const res = NextResponse.redirect(new URL("/clientes/all", request.url), {
      headers: requestHeaders
    });
    res.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    return res;
  }
  return NextResponse.next({
    request: { headers: requestHeaders },
    headers: requestHeaders
  });
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
