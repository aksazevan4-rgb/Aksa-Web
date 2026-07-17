import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE = process.env.MAINTENANCE_MODE === "true";

// Path yang tetap bisa diakses saat maintenance aktif
const BYPASS_PATHS = [
  "/maintenance",
  "/login",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/aksa-logo.png",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Izinkan path yang masuk daftar bypass
  if (BYPASS_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Izinkan dashboard admin
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Redirect ke halaman maintenance
  if (MAINTENANCE) {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};