import { TertiaryButton } from "@fremtind/jkl-button-react";
import { Link, Form } from "remix";

export const NavHeader = () => (
    <header>
        <nav>
            <Link to="/" className="jkl-link">
                Fagtimen - Remix
            </Link>
            <Form action="/logg-ut" method="post">
                <TertiaryButton forceCompact>Logg ut</TertiaryButton>
            </Form>
        </nav>
    </header>
);
