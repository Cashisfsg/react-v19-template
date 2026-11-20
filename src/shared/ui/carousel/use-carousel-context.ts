import { createContext, use } from "react";

interface CarouselItemContextType {
    index: number;
    total: number;
    isCurrent: boolean;
    slideId: string;
    tabId: string;
    label: string;
}

export const CarouselItemContext =
    createContext<CarouselItemContextType | null>(null);

export const useCarouselItemContext = () => {
    const context = use(CarouselItemContext);

    if (!context) {
        throw new Error(
            "Carousel.Item must be rendered as a direct child of Carousel.Root"
        );
    }

    return context;
};
