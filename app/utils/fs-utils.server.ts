import crypto from "crypto";
import { statSync, readFileSync } from "fs";
import { readdir, mkdir, stat, writeFile, rm } from "fs/promises";
import path from "path";

export interface Slide {
    id: string;
    content: string;
}

export interface Presentation {
    name: string;
    slides: Array<Slide>;
}

export enum FsUtilErrors {
    PRESENTATION_ALREADY_EXISTS,
    PRESENTATION_DOES_NOT_EXIST,
}

const rootPath = path.resolve(__dirname, "../app/routes/__presentations");

export const findPresentations = async () => {
    const presentations = await Promise.all(
        (
            await readdir(rootPath, { withFileTypes: true })
        )
            .filter((f) => f.isDirectory())
            .map(async (f) => {
                const presentation: Presentation = {
                    name: f.name,
                    slides: await getSlidesForPresentation(f.name),
                };
                return presentation;
            })
    );

    return presentations;
};

export const createPresentation = async (presentationName: string) => {
    const formattedPresentationName = presentationName.split(" ").join("-");
    const presentationPath = path.join(rootPath, formattedPresentationName);

    try {
        await stat(presentationPath);
        return FsUtilErrors.PRESENTATION_ALREADY_EXISTS;
    } catch (e) {
        mkdir(presentationPath);
    }

    return formattedPresentationName;
};

export const getSlidesForPresentation = async (presentationName: string) => {
    const presentationPath = path.join(rootPath, presentationName);

    try {
        // get all files
        const slides = await (await readdir(presentationPath, { withFileTypes: true })).filter((f) => f.isFile());

        if (!slides) {
            throw FsUtilErrors.PRESENTATION_DOES_NOT_EXIST;
        }

        return (
            slides
                // get creation time of files
                .map((s) => {
                    return {
                        id: s.name,
                        time: statSync(path.join(presentationPath, s.name)).birthtime.getTime(),
                    };
                })
                // sort by creation time
                .sort((a, b) => a.time - b.time)
                // get file contents
                .map((s) => {
                    const slide: Slide = {
                        id: s.id.replace(/\.mdx?$/, ""),
                        content: readFileSync(path.join(presentationPath, s.id)).toString(),
                    };

                    return slide;
                })
        );
    } catch (e) {
        throw FsUtilErrors.PRESENTATION_DOES_NOT_EXIST;
    }
};

export const writeSlide = async (presentationName: string, content: string, slideId: string = crypto.randomUUID()) => {
    const presentationPath = path.join(rootPath, presentationName);
    const slidePath = path.join(presentationPath, `${slideId}.mdx`);

    await writeFile(slidePath, content);
};

export const deletePresentation = async (presentationName: string) => {
    const presentationPath = path.join(rootPath, presentationName);
    try {
        await rm(presentationPath, { recursive: true, force: true });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

export const deleteSlide = async (presentationName: string, slideId: string) => {
    const presentationPath = path.join(rootPath, presentationName);
    const slidePath = path.join(presentationPath, `${slideId}.mdx`);

    try {
        await rm(slidePath, { force: true });
        return true;
    } catch {
        return false;
    }
};
