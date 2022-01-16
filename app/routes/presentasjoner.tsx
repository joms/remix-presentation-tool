import { Form, Link, LoaderFunction, Outlet } from "remix";
import { TertiaryButton } from "@fremtind/jkl-button-react";

import { requireSession } from "../utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    return await requireSession(request);
};

export default function Index() {
    return (
        <>
            <header>
                <Link to="/">Fagtimen - Remix</Link>
                <Form action="/logg-ut" method="post">
                    <TertiaryButton>Logg ut</TertiaryButton>
                </Form>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
}
