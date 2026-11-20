import { Button, type ButtonProps } from "./button";

import styles from "./action-button.module.css";

interface ActionButtonProps extends ButtonProps {
    /**
     * A save is in flight: the button says so, refuses the click, and keeps
     * focus.
     */
    isLoading?: boolean | undefined;
}

/**
 * A form's submit button for the case the form is busy.
 *
 * `isLoading` deliberately does **not** set the native `disabled` attribute.
 * The user has just pressed this button, so it is very likely the element they
 * are focused on, and disabling it would drop it out of the focus order and
 * take their place in the page with it. MDN names this exact case as the one
 * `aria-disabled` exists for. The trade is that the attribute changes nothing
 * on its own — it "does not change the focusability of such elements", and the
 * behaviour has to be suppressed in script, which is what the click guard below
 * is for. Without it the button would announce itself as disabled and submit
 * anyway, which is worse than not supporting the state at all.
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled
 *
 * Use the native `disabled` prop for the other kind of unavailable: a button
 * that cannot act yet and that the user has not touched.
 *
 * A refused press refuses the caller's `onClick` with it. It did not, once —
 * the button cancelled the submission and let the handler through, on the
 * principle that a caller's side effects are the caller's business. Every one
 * of them then wrote the same `if (isLoading) return`, and the ones that forgot
 * sent a second request on the second tap. A rule every caller has to obey
 * belongs here, where the ninth caller cannot forget it.
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
    isLoading = false,
    children,
    className = "",
    onClick,
    "aria-disabled": ariaDisabled,
    ...props
}) => {
    /* The string comparison is not defensive noise: React renders
       `aria-disabled` as an attribute, so `aria-disabled={false}` arrives in
       the DOM as the string "false", and testing for presence would freeze a
       button whose author said it was available. */
    const isAriaDisabled =
        isLoading || ariaDisabled === true || ariaDisabled === "true";

    /* The refusal runs before the caller's handler and keeps it from running
       at all. Cancelling the click also cancels the submission it would have
       triggered; the form's own handler stays the authority for anything that
       does not come through this button, a programmatic requestSubmit() most
       of all. */
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = event => {
        if (isAriaDisabled) {
            event.preventDefault();
            return;
        }
        onClick?.(event);
    };

    return (
        <Button
            {...props}
            aria-disabled={isAriaDisabled || undefined}
            /* No `aria-busy` here, though it looks like the obvious partner.
               MDN scopes it to an element "currently being modified", so that
               assistive technology "may want to wait before informing users of
               the update" — live regions, feeds, widgets missing their owned
               elements. Nothing is being loaded into this button; the work is
               elsewhere, and telling a screen reader to hold off on the one
               thing that is stable — its label — is the wrong trade. A caller
               that wants "saving…" announced should own a live region.
               https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy */
            /* Both states are always in the DOM and hidden with CSS instead of
               being mounted and unmounted. Swapping them by conditional render
               would resize the button mid-press and restart the spinner's
               rotation from zero on every save; stacked in one grid cell,
               neither happens. */
            data-loading={isLoading || undefined}
            className={`${styles.action} ${className}`.trim()}
            onClick={handleClick}
        >
            {/* The label needs an element of its own: a bare string
                child would be an anonymous grid item, which no selector can
                reach. */}
            <span className={styles.label}>{children}</span>
            {/* Mounted in both states; the module decides when it turns,
                keyed on `data-loading` above. Inline, so it needs no asset
                and paints in the button's text colour. */}
            <svg
                viewBox="0 0 16 16"
                fill="currentcolor"
                aria-hidden="true"
                focusable="false"
                className={styles.spinner}
            >
                <path d="M8 0c-4.355 0-7.898 3.481-7.998 7.812 0.092-3.779 2.966-6.812 6.498-6.812 3.59 0 6.5 3.134 6.5 7 0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5c0-4.418-3.582-8-8-8zM8 16c4.355 0 7.898-3.481 7.998-7.812-0.092 3.779-2.966 6.812-6.498 6.812-3.59 0-6.5-3.134-6.5-7 0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5c0 4.418 3.582 8 8 8z" />
            </svg>
        </Button>
    );
};
