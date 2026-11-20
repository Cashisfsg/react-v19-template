/** Every word the carousel says, for a page in another language to replace. */
export interface CarouselLabels {
    previous: string;
    next: string;
    /** Names the row of slide pickers. */
    pagination: string;
    /** A picker's name, by the slide's place. */
    tab: (position: number, total: number) => string;
    /** A slide's name, which is also read out when it comes into view. */
    slide: (position: number, total: number) => string;
}

export const DEFAULT_LABELS: CarouselLabels = {
    previous: "Previous slide",
    next: "Next slide",
    pagination: "Choose a slide",
    tab: position => `Slide ${position}`,
    slide: (position, total) => `${position} of ${total}`
};
