import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import "./tailwind.css";
import { themeSessionResolver } from "./sessions.server";
import { ThemeProvider, useTheme } from "remix-themes";
import clsx from "clsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";

const queryClient = new QueryClient();

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getTheme } = await themeSessionResolver(request);
  return { theme: getTheme() };
};

export function App() {
  const [theme] = useTheme();
  const location = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        {isLoading && (
          <div className="fixed top-2 left-1/2 transform -translate-x-1/2 w-1/12 rounded-full h-1 bg-slate-500 z-50 animate-pulse" />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.key}
            initial={{ x: location.pathname === "/" ? 0 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: location.pathname === "/" ? -100 : 100, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data!.theme} themeAction="/action/set-theme">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
