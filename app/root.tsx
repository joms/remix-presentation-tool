import {
    Form,
    json,
    Link,
    Links,
    LinksFunction,
    LiveReload,
    LoaderFunction,
    Meta,
    MetaFunction,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "remix";
import coreStyle from "@fremtind/jkl-core/core.min.css";
import logoStyle from "@fremtind/jkl-logo/logo.min.css";
import buttonStyle from "@fremtind/jkl-button/button.min.css";
import textInputStyle from "@fremtind/jkl-text-input/text-input.min.css";
import fieldGroupStyle from "@fremtind/jkl-field-group/field-group.min.css";
import rootStyle from "./styles/root.css";
import { hasUserSession } from "./utils/session.server";
import { TertiaryButton } from "@fremtind/jkl-button-react";

const jklStyles = [coreStyle, logoStyle, buttonStyle, textInputStyle, fieldGroupStyle];

export const links: LinksFunction = () => [
    {
        href: rootStyle,
        rel: "stylesheet",
    },
    ...jklStyles.map((style) => ({
        href: style,
        rel: "stylesheet",
    })),
];

export const meta: MetaFunction = () => {
    return { title: "Fagtimen - Remix" };
};

export default function App() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className="jkl" data-theme="light">
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                {process.env.NODE_ENV === "development" && <LiveReload />}
            </body>
        </html>
    );
}
