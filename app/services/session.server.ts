import { createCookieSessionStorage } from "@remix-run/node";
const isProduction = process.env.NODE_ENV === "production";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie works in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ["chat"], // replace this with an actual secret from env
    secure: process.env.NODE_ENV === "production", // enable this in prod only
    ...(isProduction ? { domain: "chat-maxppw.fly.dev", secure: true } : {}),
  },
});
