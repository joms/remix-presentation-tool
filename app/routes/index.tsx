import { Form, json, Link, LinksFunction, LoaderFunction, Outlet, useLoaderData } from "remix";
import { TertiaryButton } from "@fremtind/jkl-button-react";
import { hasUserSession } from "../utils/session.server";
import { findPresentations, Presentation } from "../utils/fs-utils.server";
import landingStyles from "../styles/landing.css";

interface LoaderData {
    isAuthenticated: boolean;
    presentations?: Presentation[];
}

export const links: LinksFunction = () => [
    {
        href: landingStyles,
        rel: "stylesheet",
    },
];

export const loader: LoaderFunction = async ({ request }) => {
    const session = await hasUserSession(request);

    if (!session) {
        return json({
            isAuthenticated: false,
        });
    }

    return json({
        isAuthenticated: true,
        presentations: await findPresentations(),
    });
};

export default function Index() {
    const { isAuthenticated, presentations } = useLoaderData<LoaderData>();

    if (!isAuthenticated) {
        return (
            <main>
                <h1 className="jkl-title">Velkommen til fagtimen!</h1>
                <p className="jkl-body">
                    <Link to="logg-inn" className="jkl-link">
                        Logg inn
                    </Link>{" "}
                    for å presentere.
                </p>
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
            <main>
                {!presentations || !presentations.length ? (
                    <p>
                        Du har laget noen presentasjoner enda.{" "}
                        <Link className="jkl-link" to="presentasjoner/ny-presentasjon">
                            Lag ny presentasjon
                        </Link>
                    </p>
                ) : (
                    <>
                        <h1 className="jkl-title">Presentasjoner</h1>
                        <Link className="jkl-button jkl-button--primary" to="presentasjoner/ny-presentasjon">
                            Lag ny presentasjon
                        </Link>
                        <ul className="presentation-list">
                            {presentations.map(({ name, slides }) => (
                                <li className="presentation-list__item" key={name}>
                                    <h2 className="presentation-list__item-header">{name.split("-").join(" ")}</h2>
                                    {Array.isArray(slides) && slides.length > 0 && (
                                        <Link to={`${name}/${slides[0].id}`} className="jkl-link">
                                            Presenter
                                        </Link>
                                    )}
                                    <Link to={`presentasjoner/${name}`} className="jkl-link">
                                        Rediger
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <Outlet />
            </main>
        </>
    );
}
