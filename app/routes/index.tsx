import { Form, json, Link, LinksFunction, LoaderFunction, useLoaderData } from "remix";
import { TertiaryButton } from "@fremtind/jkl-button-react";
import coreStyle from "@fremtind/jkl-core/core.min.css";
import buttonStyle from "@fremtind/jkl-button/button.min.css";
import textInputStyle from "@fremtind/jkl-text-input/text-input.min.css";
import fieldGroupStyle from "@fremtind/jkl-field-group/field-group.min.css";
import { hasUserSession } from "../utils/session.server";

const jklStyles = [coreStyle, buttonStyle, textInputStyle, fieldGroupStyle];

export const links: LinksFunction = () => [
    ...jklStyles.map((style) => ({
        href: style,
        rel: "stylesheet",
    })),
];

export const loader: LoaderFunction = async ({ request }) => {
    const session = await hasUserSession(request);
    console.log(session);

    if (!session) {
        return json({
            isAuthenticated: false,
        });
    }

    return json({
        isAuthenticated: true,
    });
};

export default function Index() {
    const { isAuthenticated } = useLoaderData<{ isAuthenticated: boolean }>();

    if (!isAuthenticated) {
        return (
            <main>
                <h1>Velkommen til fagtimen!</h1>
                <Link to="logg-inn" className="jkl-link">
                    Logg inn
                </Link>{" "}
                for å presentere.
            </main>
        );
    }

    return (
        <>
            <header>
                <Link to="/">Fagtimen - Remix</Link>
                <Form action="/logg-ut" method="post">
                    <TertiaryButton>Logg ut</TertiaryButton>
                </Form>
            </header>
            <main>Hello, world!</main>
        </>
    );
}
