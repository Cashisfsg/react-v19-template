import { Activity, useId, useMemo, useRef, useState } from "react";

import { Anchor, type AnchorPlacement } from "~/shared/ui/anchor";
import { ErrorBoundary } from "~/shared/ui/error-boundary";

import type { PolymorphicProps } from "~/shared/lib/types/polymorphic";
import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { PopoverContext, usePopoverContext } from "./use-popover-context";

import styles from "./popover.module.css";

interface RootProps extends React.PropsWithChildren {
    /**
     * What the panel's id starts with. The rest is generated, so that one name
     * on many rows stays many ids.
     */
    id?: string | undefined;
}

/**
 * A light-dismiss panel hung off a control, on the platform's own popover.
 *
 * There is no state to wire and no ref to hold: `popovertarget` opens and
 * closes the panel by id, and `popover="auto"` is what makes a tap outside,
 * Escape, or opening another popover close this one. `popovertarget` also gives
 * the trigger its `aria-expanded`. What we keep is `isOpen` — the state the
 * parts act on (focus on open, a trigger's keys) — which follows the `toggle`
 * event the moment the panel opens or closes.
 *
 * `Dialog` is the other half of this pair and not interchangeable with it: a
 * dialog is modal, takes focus and makes the rest of the page inert. A popover
 * leaves the page usable underneath, which is what a menu hanging off a header
 * button wants.
 *
 * Where the panel sits is `shared/ui/anchor`'s: by default it hangs off its
 * trigger, and `Content`'s `anchor` says how or, with `false`, leaves it to the
 * caller's own styles. A popover renders in the top layer, with no containing
 * block to be absolute within, so a hand-placed one has to say where it goes.
 */
export const Root: React.FC<RootProps> = ({ id, children }) => {
    const generatedId = useId();
    const popoverId = `${id ?? "popover"}-${generatedId}`;
    const popoverRef = useRef<HTMLElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const contextValue = useMemo(
        () => ({ popoverId, popoverRef, isOpen, setIsOpen }),
        [popoverId, isOpen]
    );

    return (
        <Anchor.Root>
            <PopoverContext value={contextValue}>{children}</PopoverContext>
        </Anchor.Root>
    );
};

Root.displayName = "Popover.Root";

interface TriggerProps extends Omit<
    React.ComponentProps<"button">,
    "popoverTarget"
> {
    /**
     * Whether the panel hangs off this button. `false` for a button that only
     * points at the panel from inside it — an item that closes it — and must
     * not take the anchor from the one that opened it.
     */
    anchor?: boolean;
}

/**
 * Opens the panel, and tells assistive technology so without being asked.
 *
 * No `aria-expanded` and no `aria-haspopup` here, and both omissions are
 * deliberate. `popovertarget` sets up "an implicit `aria-details` and
 * `aria-expanded` relationship" between the button and the panel, so stating
 * either again would duplicate what the browser already says — and ours would
 * be the worse copy, since it can only change when React re-renders.
 * https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using
 *
 * `aria-haspopup="true"` would be wrong rather than redundant: it is a synonym
 * for `aria-haspopup="menu"`, so it promises a menu with the keyboard behaviour
 * a menu implies. A caller who has actually built one passes it.
 */
export const Trigger: React.FC<TriggerProps> = ({
    anchor = true,
    type = "button",
    popoverTargetAction = "toggle",
    ...props
}) => {
    const { popoverId } = usePopoverContext();
    const Tag = anchor ? Anchor.Target : "button";

    return (
        <Tag
            {...props}
            type={type}
            /* The pair that stands in for an onClick, a piece of state and an
               invisible full-screen button to catch the tap outside. */
            popoverTarget={popoverId}
            popoverTargetAction={popoverTargetAction}
        />
    );
};

Trigger.displayName = "Popover.Trigger";

/* Polymorphic because the right element depends on what the panel holds: a list
   of actions is a `<ul>` or a `<menu>` with `<li>` items, a filter that submits
   is a `<form>`, and a plain surface is a `<div>` — which is why that is the
   default rather than the only option. The props follow whatever tag is chosen,
   so `<Popover.Content as="ul">` type-checks against `<ul>` and not against a
   div. */
interface ContentOwnProps {
    /**
     * Where the panel goes by its trigger. Under it unless stated; `false`
     * leaves it to the caller's own styles.
     */
    anchor?: AnchorPlacement | false | undefined;
    popover?: "auto" | "manual" | "hint" | undefined;
    className?: string | undefined;
    onBeforeToggle?: React.ToggleEventHandler<HTMLElement> | undefined;
    onToggle?: React.ToggleEventHandler<HTMLElement> | undefined;
    onClick?: React.MouseEventHandler<HTMLElement> | undefined;
    children?: React.ReactNode;
    ref?: React.Ref<HTMLElement> | undefined;
}

type ContentProps<E extends React.ElementType> = PolymorphicProps<
    E,
    ContentOwnProps,
    "id"
>;

export const Content = <E extends React.ElementType = "div">({
    as,
    anchor,
    popover = "auto",
    className = "",
    onBeforeToggle,
    onToggle,
    onClick,
    children,
    ref,
    ...props
}: ContentProps<E>) => {
    const { popoverId, popoverRef, isOpen, setIsOpen } = usePopoverContext();
    const Tag = as ?? "div";

    /* The contents go in before the panel is shown, not on `toggle`, which
       comes a task later: a sheet would start its slide-in empty, at no height,
       and its `translate: 0 100%` would move it nowhere until they arrived — on
       a busy phone, after most of the slide. `beforetoggle` fires while the
       panel is still closed. */
    const onBeforeToggleHandler: React.ToggleEventHandler<
        HTMLElement
    > = event => {
        if (event.newState !== "open") return;
        setIsOpen(true);
    };

    /* `toggle` fires for every way the panel opens or closes, including the
       ones no handler of ours would see — Escape, a tap outside, another
       popover taking the top layer. Reading `newState` rather than flipping
       keeps the trigger's `aria-expanded` true to the panel however it got
       there. */
    const onToggleHandler: React.ToggleEventHandler<HTMLElement> = event => {
        setIsOpen(event.newState === "open");
    };

    /* A tap on the backdrop lands on the panel element itself, because
       `::backdrop` is part of it, so the platform takes it for a tap inside and
       stays open. Outside the panel's box is outside. */
    const onBackdropClick: React.MouseEventHandler<HTMLElement> = event => {
        if (event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        const isInside =
            event.clientX >= box.left &&
            event.clientX <= box.right &&
            event.clientY >= box.top &&
            event.clientY <= box.bottom;
        if (!isInside) event.currentTarget.hidePopover();
    };

    return (
        <Anchor.Positioned<React.ElementType>
            {...props}
            as={Tag}
            placement={anchor}
            id={popoverId}
            /* `auto` is the default because light dismiss is the point: a tap
               outside, Escape, or another popover opening all close it, and
               that is what replaces the invisible catcher element a hand-rolled
               panel needs. A caller wanting a panel that stays until something
               explicitly closes it passes `manual`, which gives up all three. */
            popover={popover}
            className={`${styles.popover} ${className}`.trim()}
            onBeforeToggle={composeEventHandlers(
                onBeforeToggle,
                onBeforeToggleHandler
            )}
            onToggle={composeEventHandlers(onToggle, onToggleHandler)}
            onClick={composeEventHandlers(onClick, onBackdropClick)}
            ref={composeRefs(popoverRef, ref)}
        >
            {/* Inside the popover rather than around it, and that is not a
                style choice: React "will visually hide its children using the
                `display: "none"` CSS property", so an Activity wrapping this
                element would set that on the panel itself and the top layer
                could never show it.

                What it buys: a closed popover is still in the document, so
                without this everything inside keeps its effects running while
                nobody can see it — a query refetching, a timer ticking, a
                subscription open. React destroys those Effects and re-creates
                them on reveal, "with their previous state restored".

                Two consequences worth knowing before putting something in a
                panel. Children that render only text render nothing at all
                while hidden, "because there's no corresponding DOM element to
                apply visibility changes to". And elements with side effects of
                their own — `<video>`, `<audio>`, `<iframe>` — keep going
                regardless; those need their own cleanup in `useLayoutEffect`.
                https://react.dev/reference/react/Activity */}
            <Activity mode={isOpen ? "visible" : "hidden"}>
                {/* A panel is a place other people's components get dropped
                    into, and one of them throwing should cost the panel rather
                    than the screen behind it — which is the whole page here,
                    still interactive under an open popover. */}
                <ErrorBoundary>{children}</ErrorBoundary>
            </Activity>
        </Anchor.Positioned>
    );
};

Content.displayName = "Popover.Content";

interface CloseProps extends Omit<
    React.ComponentProps<"button">,
    "popoverTarget" | "popoverTargetAction"
> {}

/**
 * Closes the panel it sits in.
 *
 * Rarely needed — an auto popover already closes on a tap outside and on Escape
 * — but a panel whose items do something other than navigate wants a way to
 * dismiss that does not depend on aiming outside it.
 */
export const Close: React.FC<CloseProps> = ({ type = "button", ...props }) => {
    const { popoverId } = usePopoverContext();

    return (
        <button
            {...props}
            type={type}
            popoverTarget={popoverId}
            popoverTargetAction="hide"
        />
    );
};

Close.displayName = "Popover.Close";
