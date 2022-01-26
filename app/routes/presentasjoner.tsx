import { LoaderFunction, Outlet } from "remix";
import { requireSession } from "../utils/session.server";
import { NavHeader } from "../compontents/NavHeader";

export const loader: LoaderFunction = async ({ request }) => {
    return await requireSession(request);
};

export default function Index() {
    return (
        <>
            <NavHeader />
            <main>
                <Outlet />
            </main>
        </>
    );
}
