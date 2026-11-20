import { createContext, use } from "react";

interface DialogContextType {
    dialogId: string;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DialogContext = createContext<DialogContextType | null>(null);

export const useDialogContext = () => {
    const context = use(DialogContext);

    if (!context) {
        throw new Error(
            "Dialog compound components must be rendered within the Dialog.Root component"
        );
    }

    return context;
};
