import { createCookieSessionStorage, redirect } from "remix";

const sessionSecret = "en helt middels secret";

const storage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
});

export const login = async ({ username, password }: { username: string; password: string }) => {
    if (username === "fremtind" && password === "fagtimen") {
        return true;
    }

    return false;
};

export const hasUserSession = async (request: Request) => {
    const sessionCookie = await storage.getSession(request.headers.get("Cookie"));
    return sessionCookie.has("username");
};

export async function requireSession(request: Request, redirectTo: string = new URL(request.url).pathname) {
    const isAuthenticated = await hasUserSession(request);
    if (!isAuthenticated) {
        const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/login?${searchParams}`);
    }

    return true;
}

export const createUserSession = async (username: string, redirectTo: string) => {
    const session = await storage.getSession();
    session.set("username", username);

    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
};

export const logout = async (request: Request) => {
    const session = await storage.getSession(request.headers.get("Cookie"));

    return redirect("/", {
        headers: {
            "Set-Cookie": await storage.destroySession(session),
        },
    });
};
