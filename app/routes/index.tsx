import { LinksFunction, LoaderFunction, useLoaderData } from "remix";
import rootStyle from "@fremtind/jkl-core/core.min.css";
import side1Style from "../styles/root.css";

export const links: LinksFunction = () => [
    {
        href: rootStyle,
        rel: "stylesheet",
    },
    {
        href: side1Style,
        rel: "stylesheet",
    },
];

export const loader: LoaderFunction = ({ request }) => {
    return {
        intro: "Welcome to Remix!",
        links: [
            {
                href: "foobar",
                label: "Foobar",
            },

            {
                href: "https://remix.run/tutorials/blog",
                label: "15m Quickstart Blog Tutorial",
            },
            {
                href: "https://remix.run/tutorials/jokes",
                label: "Deep Dive Jokes App Tutorial",
            },
            {
                href: "https://remix.run/docs",
                label: "Remix Docs",
            },
        ],
    };
};

export default function Index() {
    const d = useLoaderData<{
        intro: string;
        links: Array<{ href: string; label: string }>;
    }>();

    return (
        <div>
            <h1>{d.intro}</h1>
            <ul>
                {d.links.map(({ href, label }) => (
                    <li key={href}>
                        <a href={href}>{label}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
