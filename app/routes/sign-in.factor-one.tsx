import { AuthenticateWithRedirectCallback } from "@clerk/remix";
import { LoaderFunction, json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  console.log("SSO Callback URL:", request.url);
  console.log("Search Params:", Object.fromEntries(searchParams));

  return json({});
};

export default function SignInCallback() {
  return <AuthenticateWithRedirectCallback />;
}
