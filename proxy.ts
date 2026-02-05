import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/auth/auth";

// we can protect routes here, most notably those that use client-side components

export default async function proxy(request: NextRequest) {
    const session = await getSession();

    const isSignInPage = request.nextUrl.pathname.startsWith("/sign-in");
    const isSignUpPage = request.nextUrl.pathname.startsWith("/sign-up");

    if ((isSignInPage || isSignUpPage) && session?.user) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }
}