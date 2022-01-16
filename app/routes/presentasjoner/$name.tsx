import { ActionFunction, Form, json, Link, LinksFunction, LoaderFunction, useLoaderData } from "remix";
import { PrimaryButton } from "@fremtind/jkl-button-react";
import coreStyle from "@fremtind/jkl-core/core.min.css";
import buttonStyle from "@fremtind/jkl-button/button.min.css";
import textInputStyle from "@fremtind/jkl-text-input/text-input.min.css";
import fieldGroupStyle from "@fremtind/jkl-field-group/field-group.min.css";
import { requireSession } from "../../utils/session.server";
import { getSlidesForPresentation, writeSlide } from "../../utils/fs-utils.server";
import { TextArea } from "@fremtind/jkl-text-input-react";

const jklStyles = [coreStyle, buttonStyle, textInputStyle, fieldGroupStyle];

enum Actions {
    AddSlide = "AddSlide",
    ModifySlide = "ModifySlide",
}

interface LoaderData {
    isAuthenticated: boolean;
    presentations?: string[];
}

export const links: LinksFunction = () => [
    ...jklStyles.map((style) => ({
        href: style,
        rel: "stylesheet",
    })),
];

interface SlideFormData {
    slide: string;
    content: string;
    action: Actions.ModifySlide;
}

interface AddSlideFormData {
    action: Actions.AddSlide;
}

type ActionData = SlideFormData | AddSlideFormData;

export const action: ActionFunction = async ({ request, params }) => {
    await requireSession(request);

    const formData = Object.fromEntries(new URLSearchParams(await request.text())) as unknown as ActionData;

    switch (formData.action) {
        case Actions.ModifySlide:
            await writeSlide(params.name!, formData.content, formData.slide);
            return null;

        case Actions.AddSlide:
            await writeSlide(params.name!, "");
            return null;
    }
};

export const loader: LoaderFunction = async ({ request, params }) => {
    await requireSession(request);

    const presentation = await getSlidesForPresentation(params.name!);

    return json({
        presentation,
    });
};

export default function Presentation() {
    const { presentation } = useLoaderData<{ presentation: Array<{ id: string; content: string }> }>();

    if (!presentation.length) {
        return (
            <>
                <h1>Fant ikke denne presentasjonen</h1>
                <Link to="/" className="jkl-link">
                    Tilbake
                </Link>
            </>
        );
    }

    return (
        <>
            <h1>Oppdater presentasjon</h1>
            <section>
                <h2 className="jkl-sr-only">Legg til slide</h2>
                <form method="post">
                    <input type="radio" name="action" value={Actions.AddSlide} checked hidden readOnly />
                    <PrimaryButton>Legg til slide</PrimaryButton>
                </form>
            </section>
            {presentation.map((p, i) => (
                <section key={p.id}>
                    <h2>#{i + 1}</h2>
                    <form method="post">
                        <TextArea defaultValue={p.content} label="Slide content" name="content" />
                        <input type="radio" name="slide" value={p.id} checked hidden readOnly />
                        <input type="radio" name="action" value={Actions.ModifySlide} checked hidden readOnly />
                        <PrimaryButton>Lagre</PrimaryButton>
                    </form>
                </section>
            ))}
        </>
    );
}
