import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (pathname.startsWith("/admin/login")) {
		return NextResponse.next()
	}

	const hasSupabaseSessionCookie = request.cookies
		.getAll()
		.some((cookie) => cookie.name.startsWith("sb-"))

	if (!hasSupabaseSessionCookie) {
		return NextResponse.redirect(new URL("/admin/login", request.url))
	}

	return NextResponse.next()
}

export const config = { matcher: ["/admin/:path*"] }
