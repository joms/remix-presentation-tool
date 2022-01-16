import { ActionFunction, Form, json, LoaderFunction, redirect, useActionData } from "remix";
import { TextInput } from "@fremtind/jkl-text-input-react";
import { PrimaryButton } from "@fremtind/jkl-button-react";
import { FieldGroup } from "@fremtind/jkl-field-group-react";
import { createUserSession, hasUserSession, login } from "../utils/session.server";

interface FormData {
    username: string;
    password: string;
}

export const action: ActionFunction = async ({ request }) => {
    const { username, password } = Object.fromEntries(new URLSearchParams(await request.text())) as unknown as FormData;

    const isAuthenticated = await login({ username, password });

    if (!isAuthenticated) {
        return json({
            error: "Feil brukernavn eller passord",
        });
    }

    return createUserSession(username, "/");
};

export const loader: LoaderFunction = async ({ request }) => {
    if (await hasUserSession(request)) {
        return redirect("/");
    }

    return null;
};

export default function Login() {
    const actionData = useActionData<{ error: string }>();
    return (
        <main>
            <h1 className="jkl-title">Velkommen til fagtimen!</h1>
            <Form method="post">
                <FieldGroup
                    variant="large"
                    legend="Fyll inn brukernavn og passord for å logge inn og finne dine presentasjoner."
                    errorLabel={actionData?.error}
                >
                    <TextInput label="Brukernavn" name="username" autoComplete="username" required />
                    <TextInput
                        label="Passord"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                    />
                </FieldGroup>
                <PrimaryButton>Logg inn</PrimaryButton>
            </Form>
        </main>
    );
}
