import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  protectedRoutes: [
    "/",               // Home
    "/dashboard",      // Transaction List
    "/admin/(.*)",     // All admin tools: receipts, reports, etc.
    "/profile",        // Admin profile
  ],
  publicRoutes: [
    "/sign-in",
    "/sign-up"
  ]
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
