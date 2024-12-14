import { enforceAuthentication } from "~/services/session.server";
import type { Route } from "../+types/files";

export function meta() {
  return [{ title: "Edit Picture" }];
}

export default function Edit() {
  return (
    <>
      <h1>Edit</h1>
    </>
  );
}

export async function loader({ request }: Route.ActionArgs) {
  await enforceAuthentication(request);

  return null;
}
