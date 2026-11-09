import { NextResponse, type NextRequest } from "next/server";
import { MAINTENANCE, maintenancePage } from "./lib/maintenance";

export function proxy(request: NextRequest) {
  if (MAINTENANCE) return maintenancePage(request.cookies.get("lang")?.value);

  // The admin area is only ever shown in English, whatever language the visitor
  // picked for the shop. This tells src/i18n/server.ts so, for pages and server
  // actions alike.
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  const headers = new Headers(request.headers);
  headers.set("x-locale", "en");

  return NextResponse.next({ request: { headers } });
}

// Everything except Next's static files and the brand images the maintenance page uses.
export const config = { matcher: ["/((?!_next/static|_next/image|brand/|favicon.ico).*)"] };
