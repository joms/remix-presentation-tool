import { Link, LinksFunction, LoaderFunction, MetaFunction, Outlet, useCatch, useLoaderData, useLocation } from "remix";
import { getSlidesForPresentation, Slide } from "../utils/fs-utils.server";
import { useMemo } from "react";
import styleLink from "../styles/presentation.css";
import { requireSession } from "../utils/session.server";

export const links: LinksFunction = () => [
    {
        href: styleLink,
        rel: "stylesheet",
    },
    {
        href: "https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/default.min.css",
        rel: "stylesheet",
    },
];

export const meta: MetaFunction = ({ data, location }) => {
    const currentSlideIndex = data.slides.findIndex((slide: Slide) => location.pathname.includes(slide.id));
    const title: Slide = data.slides[currentSlideIndex].attributes.title ?? "Fagtimen";

    return {
        title: `${title} - Remix`,
    };
};

export const loader: LoaderFunction = async ({ request }) => {
    await requireSession(request);
    const presentationName = new URL(request.url).pathname.split("/").filter((u) => !!u)[0];
    const slides = await getSlidesForPresentation(presentationName);

    return { slides, presentationName };
};

export default function Present() {
    const { slides, presentationName } = useLoaderData<{ slides: Slide[]; presentationName: string }>();
    const location = useLocation();

    const currentSlideIndex = useMemo(() => {
        return slides.findIndex((slide) => location.pathname.includes(slide.id));
    }, [location, slides]);

    return (
        <>
            <nav>
                <div className="nav--left">
                    {!location.pathname.includes(slides[0]?.id) && (
                        <Link to={`${presentationName}/${slides[currentSlideIndex - 1]?.id}`} className="jkl-link">
                            Forrige
                        </Link>
                    )}
                    {!location.pathname.includes(slides[slides.length - 1]?.id) && (
                        <Link to={`${presentationName}/${slides[currentSlideIndex + 1]?.id}`} className="jkl-link">
                            Neste
                        </Link>
                    )}
                </div>
                <div className="nav--right">
                    <Link to="/" className="jkl-link">
                        Avbryt
                    </Link>
                </div>
            </nav>
            <main data-theme={slides[currentSlideIndex].attributes.theme} className="jkl">
                <Outlet />
            </main>
        </>
    );
}
