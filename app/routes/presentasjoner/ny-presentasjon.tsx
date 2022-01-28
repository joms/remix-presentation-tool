import { ActionFunction, Form, json, LinksFunction, redirect, useActionData } from "remix";
import { PrimaryButton } from "@fremtind/jkl-button-react";
import { TextInput } from "@fremtind/jkl-text-input-react";
import { requireSession } from "../../utils/session.server";
import { createPresentation, FsUtilErrors, writeSlide } from "../../utils/fs-utils.server";
import stylesLink from "../../styles/ny-presentasjon.css";

export const links: LinksFunction = () => [
    {
        href: stylesLink,
        rel: "stylesheet",
    },
];

export const action: ActionFunction = async ({ request }) => {
    await requireSession(request);
    const formData = new URLSearchParams(await request.text());

    const presentationName = formData.get("presentation-name");

    if (!presentationName) {
        return json(
            {
                error: "Du må oppgi et presentasjonsnavn",
            },
            400
        );
    }

    const createdPresentation = await createPresentation(presentationName);
    switch (createdPresentation) {
        case FsUtilErrors.PRESENTATION_ALREADY_EXISTS:
            return json({
                error: "Det finnes allerede en presentasjon med dette navnet. Vennligst finn et nytt navn",
            });

        default:
            await writeSlide(createdPresentation, "");
            return redirect(`presentasjoner/${createdPresentation}`);
    }
};

export default function NewPresentation() {
    const actionData = useActionData<{ error?: string }>();

    return (
        <>
            <h1>Ny presentasjon</h1>
            <Form method="post">
                <TextInput label="Presentasjonsavn" name="presentation-name" errorLabel={actionData?.error} />
                <PrimaryButton>Lagre</PrimaryButton>
            </Form>
        </>
    );
}
