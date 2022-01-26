import { ActionFunction, json, Link, LinksFunction, LoaderFunction, redirect, useLoaderData, useSubmit } from "remix";
import { PrimaryButton, SecondaryButton, TertiaryButton } from "@fremtind/jkl-button-react";
import { TextArea } from "@fremtind/jkl-text-input-react";
import { requireSession } from "../../utils/session.server";
import { deletePresentation, deleteSlide, getSlidesForPresentation, writeSlide } from "../../utils/fs-utils.server";
import styleLink from "../../styles/rediger-presentasjon.css";

enum Actions {
    AddSlide = "AddSlide",
    ModifySlide = "ModifySlide",
    DeletePresentation = "DeletePresentation",
    DeleteSlide = "DeleteSlide",
}

export const links: LinksFunction = () => [
    {
        href: styleLink,
        rel: "stylesheet",
    },
];

interface SlideFormData {
    slide: string;
    content: string;
    action: Actions.ModifySlide;
}

interface AddSlideFormData {
    action: Actions.AddSlide;
}

interface DeleteSlideData {
    action: Actions.DeleteSlide;
    id: string;
}

interface DeletePresentation {
    action: Actions.DeletePresentation;
}

type ActionData = SlideFormData | AddSlideFormData | DeleteSlideData | DeletePresentation;

export const action: ActionFunction = async ({ request, params }) => {
    await requireSession(request);

    const formData = Object.fromEntries(new URLSearchParams(await request.text())) as unknown as ActionData;

    switch (request.method.toLowerCase()) {
        case "post":
            switch (formData.action) {
                case Actions.ModifySlide:
                    await writeSlide(params.name!, formData.content, formData.slide);
                    return null;

                case Actions.AddSlide:
                    await writeSlide(params.name!, "");
                    return null;
            }
        case "delete":
            switch (formData.action) {
                case Actions.DeleteSlide:
                    if (await deleteSlide(params.name!, formData.id)) {
                        return null;
                    } else {
                        return json({ error: "Noe gikk galt" }, { status: 500 });
                    }

                case Actions.DeletePresentation:
                    console.log("delete presentation");
                    if (await deletePresentation(params.name!)) {
                        console.log("yolo");
                        return redirect("/");
                    } else {
                        return json({ error: "Noe gikk galt" }, { status: 500 });
                    }
            }
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
    const submit = useSubmit();

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
            <h1>Rediger presentasjon</h1>

            <div className="presentation-actions">
                <section>
                    <h2 className="jkl-sr-only">Legg til slide</h2>
                    <form method="post">
                        <input type="radio" name="action" value={Actions.AddSlide} checked hidden readOnly />
                        <PrimaryButton>Legg til slide</PrimaryButton>
                    </form>
                </section>

                <section>
                    <h2 className="jkl-sr-only">Slett presentasjon</h2>
                    <TertiaryButton
                        onClick={() => {
                            if (confirm("Er du sikker på at du vil slette denne presentasjonen?")) {
                                submit({ action: Actions.DeletePresentation }, { method: "delete" });
                            }
                        }}
                    >
                        Slett presentasjon
                    </TertiaryButton>
                </section>
            </div>

            <section className="slide-list">
                <h2 className="jkl-sr-only">Slides</h2>

                {presentation.map((p, i) => (
                    <section key={p.id} className="slide-edit">
                        <h2 className="slide-edit__header" id={`slide-${p.id}`}>
                            #{i + 1}
                        </h2>
                        <form className="slide-edit__content" method="post">
                            <TextArea defaultValue={p.content} label="Slide content" name="content" />
                            <input type="radio" name="slide" value={p.id} checked hidden readOnly />
                            <input type="radio" name="action" value={Actions.ModifySlide} checked hidden readOnly />
                            <PrimaryButton>Lagre</PrimaryButton>
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    if (confirm("Er du sikker på at du vil slette denne sliden?")) {
                                        submit(
                                            { id: p.id, action: Actions.DeleteSlide },
                                            { method: "delete", replace: true }
                                        );
                                    }
                                }}
                                className="jkl-spacing-l--left"
                            >
                                Slett
                            </SecondaryButton>
                        </form>
                    </section>
                ))}
            </section>
        </>
    );
}
