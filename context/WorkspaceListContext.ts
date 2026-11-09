import { createContext, useContext } from "react";
import { Workspace } from "@/models/Workspace";

export type CollectionContextType = {
    collections: Workspace[];

    prependCollection: (collection: Workspace) => void;
    appendCollection: (collection: Workspace) => void;

    deleteCollection: (id: string) => void;
    renameCollection: (id: string, title: string) => void;
};

const CollectionContext = createContext<CollectionContextType | null>(null);

export function useCollectionContext() {
    const context = useContext(CollectionContext);

    if (!context) {
        throw new Error(
            "useCollectionContext must be used within CollectionContext.Provider"
        );
    }

    return context;
}

export default CollectionContext;