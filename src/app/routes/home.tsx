import { HomePage } from "~/pages/home";

import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [{ title: "React v19 template" }];

export default function HomeRoute() {
    return <HomePage />;
}
