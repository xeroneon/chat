import { AuthenticateWithRedirectCallback } from "@clerk/remix";
import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  // Optional: Redirect to a specific page after successful sign-in
  const redirectTo = searchParams.get("redirect_url") ?? "/";

  return redirect(redirectTo);
};

export default function SignUpCallback() {
  return <AuthenticateWithRedirectCallback />;
}
