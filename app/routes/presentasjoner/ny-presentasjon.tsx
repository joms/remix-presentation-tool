import { ActionFunction, Form, json, LinksFunction, redirect, useActionData } from "remix";
import { PrimaryButton } from "@fremtind/jkl-button-react";
import coreStyle from "@fremtind/jkl-core/core.min.css";
import buttonStyle from "@fremtind/jkl-button/button.min.css";
import textInputStyle from "@fremtind/jkl-text-input/text-input.min.css";
import fieldGroupStyle from "@fremtind/jkl-field-group/field-group.min.css";
import { requireSession } from "../../utils/session.server";
import { createPresentation, FsUtilErrors } from "../../utils/fs-utils.server";
import { TextInput } from "@fremtind/jkl-text-input-react";

const jklStyles = [coreStyle, buttonStyle, textInputStyle, fieldGroupStyle];

export const links: LinksFunction = () => [
    ...jklStyles.map((style) => ({
        href: style,
        rel: "stylesheet",
    })),
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
            return redirect(`presentasjoner/${createdPresentation}`);
    }
};

export default function NewPresentation() {
    const actionData = useActionData<{ error?: string }>();

    return (
        <Form action="" method="post">
            <TextInput label="Presentasjonnavn" name="presentation-name" required errorLabel={actionData?.error} />
            <PrimaryButton>Lagre</PrimaryButton>
        </Form>
    );
}
