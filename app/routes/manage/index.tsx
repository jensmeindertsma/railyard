import { redirect } from "react-router";
import { enforceAuthentication } from "~/services/session.server";
import type { Route } from "../+types/index";

export default function Home() {
  return null;
}

export async function loader({ request }: Route.ActionArgs) {
  await enforceAuthentication(request);

  return redirect("/manage/pictures");
}
