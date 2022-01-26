import {
    ActionFunction,
    Form,
    json,
    Link,
    LinksFunction,
    LoaderFunction,
    Outlet,
    useActionData,
    useLoaderData,
} from "remix";
import { PrimaryButton, TertiaryButton } from "@fremtind/jkl-button-react";
import { Logo } from "@fremtind/jkl-logo-react";
import { createUserSession, hasUserSession, login } from "../utils/session.server";
import { findPresentations, Presentation } from "../utils/fs-utils.server";
import landingStyles from "../styles/landing.css";
import { TextInput } from "@fremtind/jkl-text-input-react";
import { FieldGroup } from "@fremtind/jkl-field-group-react";
import { NavHeader } from "../compontents/NavHeader";

interface LoginFormData {
    username: string;
    password: string;
}

interface UnauthenticatedLoaderData {
    isAuthenticated: false;
}

interface AuthenticatedLoaderData {
    isAuthenticated: true;
    presentations: Presentation[];
}

type LoaderData = UnauthenticatedLoaderData | AuthenticatedLoaderData;

export const links: LinksFunction = () => [
    {
        href: landingStyles,
        rel: "stylesheet",
    },
];

export const action: ActionFunction = async ({ request }) => {
    const { username, password } = Object.fromEntries(
        new URLSearchParams(await request.text())
    ) as unknown as LoginFormData;

    const isAuthenticated = await login({ username, password });

    if (!isAuthenticated) {
        return json({
            error: "Feil brukernavn eller passord",
        });
    }

    return createUserSession(username, "/");
};

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
    const loaderData = useLoaderData<LoaderData>();
    const actionData = useActionData<{ error?: string }>();

    if (!loaderData.isAuthenticated) {
        return (
            <>
                <header className="landing-header">
                    <div className="jkl-bg-logo-wrapper">
                        <Logo centered isSymbol className="jkl-bg-logo" />
                    </div>
                    <Logo inverted className="jkl-landing-logo" />
                    <h1>Fagtimen presentasjonsverktøy</h1>
                    <h2>Remix</h2>
                </header>
                <main className="landing-content">
                    <Form method="post">
                        <FieldGroup
                            legend="Logg inn for å finne dine presentasjoner"
                            variant="large"
                            errorLabel={actionData?.error}
                        >
                            <TextInput width="320px" label="Brukernavn" name="username" />
                            <TextInput width="320px" label="Passord" type="password" name="password" />
                        </FieldGroup>
                        <PrimaryButton>Logg inn</PrimaryButton>
                    </Form>
                </main>
            </>
        );
    }

    return (
        <>
            <NavHeader />
            <main className="presentations">
                {!loaderData.presentations.length ? (
                    <p className="presentation-list-empty-error">
                        Du har ikke laget noen presentasjoner enda.
                        <Link className="jkl-button jkl-button--primary" to="presentasjoner/ny-presentasjon">
                            Lag din første presentasjon
                        </Link>
                    </p>
                ) : (
                    <>
                        <h1>Dine presentasjoner</h1>
                        <Link className="jkl-button jkl-button--primary" to="presentasjoner/ny-presentasjon">
                            Ny presentasjon
                        </Link>

                        <ul className="presentation-list">
                            {loaderData.presentations.map(({ name, slides }) => (
                                <li className="presentation-card" key={name}>
                                    <h2 className="presentation-card__header">{name.split("-").join(" ")}</h2>

                                    <p className="presentation-card__content">{slides.length} slides</p>

                                    <div className="presentation-card__footer">
                                        {slides.length > 0 && (
                                            <Link to={`${name}/${slides[0].id}`} className="jkl-link">
                                                Presenter
                                            </Link>
                                        )}

                                        <Link to={`presentasjoner/${name}`} className="jkl-link">
                                            Rediger
                                        </Link>
                                    </div>
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
