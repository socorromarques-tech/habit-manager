import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Rotas publicas que nao precisam de autenticacao
  const publicRoutes = ["/", "/api/auth"];
  
  // Verifica se a rota eh publica
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith("/api/auth")
  );

  // Se nao estiver autenticado e tentar acessar rota protegida
  if (!token && !isPublicRoute) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
