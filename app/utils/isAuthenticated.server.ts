import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/session.server";

export const isAuthenticated = async (args: LoaderFunctionArgs) => {
  const { request } = args;
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  if (!user) {
    throw redirect("/sign-in");
  }
};
