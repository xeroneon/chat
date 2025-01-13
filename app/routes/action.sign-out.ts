import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { sessionStorage } from "~/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  return redirect("/sign-in", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}
