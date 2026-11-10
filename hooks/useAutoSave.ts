import { useCallback, useEffect, useRef } from "react";

type Options<T> = {
    save: (id: string, changes: Partial<T>) => Promise<unknown>;
    delay?: number;
};

export function useAutoSave<T>({ save, delay = 1000 }: Options<T>) {
    const pending = useRef(new Map<string, Partial<T>>());
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlight = useRef<Promise<void>>(Promise.resolve());

    const saveRef = useRef(save);
    useEffect(() => {
        saveRef.current = save;
    }, [save]);

    const flush = useCallback(async () => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        if (pending.current.size === 0) return inFlight.current;

        const batch = pending.current;
        pending.current = new Map();

        const saving = inFlight.current.then(() => Promise.all(
            [...batch].map(async ([id, changes]) => {
                try {
                    await saveRef.current(id, changes);
                } catch (error) {
                    console.error("자동 저장 실패:", id, error);
                    pending.current.set(id, {
                        ...changes,
                        ...pending.current.get(id),
                    });
                }
            })
        )).then(() => undefined);
        inFlight.current = saving;
        await saving;
    }, []);

    const schedule = useCallback(
        (id: string, changes: Partial<T>) => {
            pending.current.set(id, {
                ...pending.current.get(id),
                ...changes,
            });

            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(flush, delay);
        },
        [delay, flush]
    );

    const discard = useCallback((id: string) => {
        pending.current.delete(id);
    }, []);

    const discardFields = useCallback((id: string, fields: (keyof T)[]) => {
        const changes: Partial<T> = { ...pending.current.get(id) };
        for (const field of fields) delete changes[field];
        if (Object.keys(changes).length) pending.current.set(id, changes);
        else pending.current.delete(id);
    }, []);

    useEffect(() => {
        const onHidden = () => {
            if (document.visibilityState === "hidden") flush();
        };
        const onPageHide = () => { flush(); };

        document.addEventListener("visibilitychange", onHidden);
        window.addEventListener("pagehide", onPageHide);

        return () => {
            document.removeEventListener("visibilitychange", onHidden);
            window.removeEventListener("pagehide", onPageHide);
            flush();
        };
    }, [flush]);

    return { schedule, flush, discard, discardFields };
}
