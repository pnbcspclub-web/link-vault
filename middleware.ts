import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/api"]; // protect dashboard + api

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  if (pathname.startsWith("/api/links")) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey && apiKey === process.env.API_KEY) {
      return NextResponse.next();
    }
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (pathname.startsWith("/api")) {
    const authCookie = req.cookies.get("lv_auth")?.value;
    if (authCookie === "ok") return NextResponse.next();
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const authCookie = req.cookies.get("lv_auth")?.value;
  if (authCookie === "ok") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
};
