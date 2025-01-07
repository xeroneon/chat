import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import "./tailwind.css";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { createClerkClient } from "@clerk/remix/api.server";
import { ClerkApp } from "@clerk/remix";
import { themeSessionResolver } from "./sessions.server";
import { ThemeProvider, useTheme } from "remix-themes";
import clsx from "clsx";
import { db } from "./db/db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap",
  },
];

async function createUser(clerkUserId: string) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  const user = await clerkClient.users.getUser(clerkUserId);
  try {
    const newUser = await db
      .insert(users)
      .values({
        username: user.username as string,
        email: user.primaryEmailAddress?.emailAddress as string,
        clerkUserId,
      })
      .returning({ userId: users.userId, username: users.username });

    return newUser[0];
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
}

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const { getTheme } = await themeSessionResolver(request);
    const { sessionId, userId, getToken } = request.auth;
    if (userId) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, userId));

      if (result.length <= 0) {
        createUser(userId);
      }
    }
    // fetch data
    return { theme: getTheme() };
  });
};

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

// Use the dynamic theme selection in ClerkApp
export default ClerkApp(AppWithProviders);
