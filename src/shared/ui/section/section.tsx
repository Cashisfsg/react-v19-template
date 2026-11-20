import { useCallback, useEffect, useId, useMemo, useRef } from "react";

import type { PolymorphicProps } from "~/shared/lib/types/polymorphic";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import {
    PART_ATTRIBUTE,
    SectionContext,
    useSectionContext,
    type SectionPart
} from "./use-section-context";

interface RegisteredPart {
    id: string;
    element: Element;
}

/* Document order, which is the order the name is read in — `aria-labelledby`
   concatenates what it points at, in the order it is given. */
const byDocumentPosition = (
    one: RegisteredPart,
    other: RegisteredPart
): number =>
    one.element.compareDocumentPosition(other.element) &
    Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;

interface RootOwnProps {
    "aria-labelledby"?: string | undefined;
    "aria-describedby"?: string | undefined;
    ref?: React.Ref<HTMLElement> | undefined;
}

export type RootProps<E extends React.ElementType = "section"> =
    PolymorphicProps<E, RootOwnProps>;

/**
 * A block of related content, as a region a reader can find.
 *
 * A `section` earns its name from its heading and nothing else: unnamed it
 * carries no role at all and is no more than a `div`. Writing that by hand
 * means an id constant and an `aria-labelledby` at every call site. Here the
 * heading is `Section.Label` and the wiring is this component's business.
 *
 * `as` is there because the tag is a real decision. `section` is a part of its
 * page; `article` is for something that would still make sense taken out of it.
 * The default is the common case.
 *
 * **The references are written onto the node, not rendered.** React renders top
 * down, so at the Root's own render there is nothing to point at yet — the
 * parts have not run. Rendering the attributes would mean holding the ids in
 * state and paying a render per part instead. React never sets these two
 * attributes here, so there is nothing for it to overwrite afterwards.
 *
 * Two things write, and each covers what the other cannot see. A part writes as
 * it attaches, which is the only way a part arriving later gets noticed. The
 * effect below writes on mount, because the commit phase runs bottom up and a
 * part's ref attaches *before* the Root's, onto a node that is not there yet;
 * and it writes again when the call site changes a reference of its own, which
 * no ref callback would ever hear about.
 */
export const Root = <E extends React.ElementType = "section">({
    as,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ref,
    ...props
}: RootProps<E>) => {
    const Tag = as ?? "section";
    /* The tag names the parts' ids, so a stray id in the DOM says where it came
       from. Only when it is a tag: `as` also takes a component, and
       stringifying one of those yields its whole source. */
    const rootElement = typeof Tag === "string" ? Tag : "section";

    const node = useRef<HTMLElement | null>(null);
    /* Lists rather than flags: both attributes take several ids by design, and
       a flag cannot tell "one of two descriptions unmounted" from "the last one
       did" — it would drop the reference while a description was still on
       screen.

       Each entry keeps its element, because the order of the ids is the order
       the name is read in and mount order is not document order: a part that
       appears between two already on screen registers last, and `useId` hands
       out numbers in mount order too, so neither is a stand-in for position. */
    const parts = useRef<Record<SectionPart, RegisteredPart[]>>({
        label: [],
        description: []
    });
    /* Read from a ref callback, which is outside render and would otherwise
       keep whatever these were when the part first attached. Filled in the
       effect below rather than here: a render must not touch a ref. */
    const given = useRef({
        label: ariaLabelledBy,
        description: ariaDescribedBy
    });

    const write = useCallback((part: SectionPart) => {
        const element = node.current;
        if (!element) return;

        const inDocumentOrder = [...parts.current[part]]
            .sort(byDocumentPosition)
            .map(registered => registered.id);
        const value = [...inDocumentOrder, given.current[part]]
            .filter(Boolean)
            .join(" ");

        /* Taken off rather than left empty when there is nothing to point at: a
           dangling `aria-labelledby` is worse than none, since assistive
           technology reads nothing where it was promised something. */
        if (value) element.setAttribute(PART_ATTRIBUTE[part], value);
        else element.removeAttribute(PART_ATTRIBUTE[part]);
    }, []);

    const register = useCallback(
        (part: SectionPart, id: string, element: Element) => {
            parts.current[part] = [...parts.current[part], { id, element }];
            write(part);

            return () => {
                parts.current[part] = parts.current[part].filter(
                    registered => registered.id !== id
                );
                write(part);
            };
        },
        [write]
    );

    const context = useMemo(
        () => ({ rootElement, register }),
        [rootElement, register]
    );

    const rootRef = useCallback((element: HTMLElement) => {
        node.current = element;

        return () => {
            node.current = null;
        };
    }, []);

    const composedRef = useMemo(
        () => composeRefs(rootRef, ref),
        [rootRef, ref]
    );

    /* Mount, and every later change to a reference the call site owns. Neither
       is visible to a ref callback: on mount the Root's node is attached after
       its children's, and a prop changing moves nothing at all. */
    useEffect(() => {
        given.current = { label: ariaLabelledBy, description: ariaDescribedBy };
        write("label");
        write("description");
    }, [write, ariaLabelledBy, ariaDescribedBy]);

    return (
        <SectionContext value={context}>
            <Tag
                {...props}
                ref={composedRef}
            />
        </SectionContext>
    );
};

Root.displayName = "Section.Root";

/**
 * A part's own id, and the ref that keeps it on the Root while the part is
 * mounted.
 *
 * Each part carries its own id rather than sharing one from the Root: two
 * headings in a section are one name in two parts, which is what
 * `aria-labelledby` takes a list for — sharing an id would put the same one
 * twice in the document and leave the second heading out of the name.
 */
const usePart = <T extends Element>(
    part: SectionPart,
    given: string | undefined,
    callerRef: React.Ref<T> | undefined
) => {
    const { rootElement, register } = useSectionContext();
    const generated = `${rootElement}-${part}-${useId()}`;
    /* A caller with an id of its own keeps it — something else may already
       point at that element — and the Root is told whichever one is really on
       it. */
    const id = given ?? generated;

    const announce = useCallback(
        (element: T) => register(part, id, element),
        [register, part, id]
    );

    /* Composed here and held, not built in the markup: React detaches and
       reattaches a callback ref whenever its identity changes, so composing
       inline would unregister and re-register on every render — two writes to
       the attribute each time, and with several parts the id would move to the
       end of the list on each pass. Measured before fixing: three renders, five
       calls. Changing the id is the one case that *should* re-run, and it does,
       because the id is a dependency. */
    const ref = useMemo(
        () => composeRefs(announce, callerRef),
        [announce, callerRef]
    );

    return { id, ref };
};

interface PartOwnProps {
    /** Kept when given: something else may already point at the element. */
    id?: string | undefined;
    ref?: React.Ref<HTMLElement> | undefined;
}

export type LabelProps<E extends React.ElementType = "h2"> = PolymorphicProps<
    E,
    PartOwnProps
>;

/**
 * The heading that names the section.
 *
 * `h2` by default because a section of a page sits under the page's own `h1`;
 * `as` is there for the screens where the nesting is deeper.
 */
export const Label = <E extends React.ElementType = "h2">({
    as,
    id,
    ref,
    ...props
}: LabelProps<E>) => {
    const Tag = as ?? "h2";
    const { id: partId, ref: partRef } = usePart("label", id, ref);

    return (
        <Tag
            {...props}
            id={partId}
            ref={partRef}
        />
    );
};

Label.displayName = "Section.Label";

export type DescriptionProps<E extends React.ElementType = "p"> =
    PolymorphicProps<E, PartOwnProps>;

export const Description = <E extends React.ElementType = "p">({
    as,
    id,
    ref,
    ...props
}: DescriptionProps<E>) => {
    const Tag = as ?? "p";
    const { id: partId, ref: partRef } = usePart("description", id, ref);

    return (
        <Tag
            {...props}
            id={partId}
            ref={partRef}
        />
    );
};

Description.displayName = "Section.Description";
