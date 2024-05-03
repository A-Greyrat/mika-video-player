import React, {useCallback, useEffect, useRef} from "react";

export type ShortcutCallback = (videoElement?: HTMLVideoElement | null, containerElement?: HTMLDivElement | null) => void;

export type Shortcut = {
    key: string | number;
    type: 'keydown' | 'pointerdown';
    callback: ShortcutCallback;

    root?: 'document' | 'video';
};

export const defaultShortcuts: Shortcut[] = [
    {
        key: ' ',
        type: 'keydown',
        root: 'document',
        callback: (videoElement) => {
            if (videoElement && videoElement.readyState > 2) {
                if (videoElement.paused) videoElement.play().catch(undefined);
                else videoElement.pause();
            }
        },
    },
    {
        key: 'f',
        type: 'keydown',
        root: 'document',
        callback: (_, containerElement) => {
            if (containerElement) {
                if (document.fullscreenElement !== null) document.exitFullscreen().catch(undefined);
                else containerElement.requestFullscreen().catch(undefined);
            }
        }
    },
    {
        key: 'ArrowLeft',
        type: 'keydown',
        root: 'document',
        callback: (videoElement) => {
            if (videoElement) videoElement.currentTime -= 5;
        }
    },
    {
        key: 'ArrowRight',
        type: 'keydown',
        root: 'document',
        callback: (videoElement) => {
            if (videoElement) videoElement.currentTime += 5;
        }
    },
    {
        key: 'm',
        type: 'keydown',
        root: 'document',
        callback: (videoElement) => {
            if (videoElement) videoElement.muted = !videoElement.muted;
        }
    },
    {
        key: 'ArrowUp',
        type: 'keydown',
        root: 'video',
        callback: (videoElement) => {
            if (videoElement) videoElement.volume = Math.min(1, videoElement.volume + 0.1);
        },
    },
    {
        key: 'ArrowDown',
        type: 'keydown',
        root: 'video',
        callback: (videoElement) => {
            if (videoElement) videoElement.volume = Math.max(0, videoElement.volume - 0.1);
        },
    },
    {
        key: 0,
        type: 'pointerdown',
        root: 'video',
        callback: (videoElement) => {
            if (videoElement && videoElement.readyState >= 2) {
                if (videoElement.paused) videoElement.play().catch(undefined);
                else videoElement.pause();
            }
        }
    }
];

export const useShortcut = (shortcuts: Shortcut[], videoElement?: HTMLVideoElement | null, containerElement?: HTMLDivElement | null, controllerElement?: HTMLDivElement | null) => {
    const videoEventMapRef = useRef<Map<string, (e: Event | React.PointerEvent | React.KeyboardEvent) => void>>(new Map());

    useEffect(() => {
        const shortcutMap = new Map<string, Map<string, Map<string | number, Shortcut>>>();
        const uninstallList: (() => void)[] = [];
        videoEventMapRef.current.clear();

        shortcuts.forEach((shortcut) => {
            if (!shortcutMap.has(shortcut.root || 'document'))
                shortcutMap.set(shortcut.root || 'document', new Map());

            const shortcutList = shortcutMap.get(shortcut.root || 'document')!;
            if (!shortcutList.has(shortcut.type))
                shortcutList.set(shortcut.type, new Map());

            const shortcutType = shortcutList.get(shortcut.type)!;
            shortcutType.set(shortcut.key, shortcut);
        });

        for (const [root, shortcutList] of shortcutMap) {
            const rootElement = root === 'document' ? document : root === 'video' ? videoElement : undefined;
            for (const [type, map] of shortcutList) {
                const callback = (e: Event | React.PointerEvent | React.KeyboardEvent) => {
                    if (rootElement === document && e.target !== document.body && e.target !== controllerElement && e.target !== containerElement) return;

                    const key = ("key" in e) ? e.key : ("button" in e) ? e.button: undefined;
                    if (key !== undefined && (typeof key === 'string' || typeof key === 'number') && map.has(key)) {
                        e.preventDefault();
                        e.stopPropagation();
                        map.get(key)!.callback(videoElement, containerElement);
                    }
                };

                if (root === 'document') rootElement && rootElement.addEventListener(type, callback);
                else videoEventMapRef.current.set(type, callback);

                uninstallList.push(() => rootElement && rootElement.removeEventListener(type, callback));
            }
        }

        return () => {
            uninstallList.forEach((uninstall) => uninstall());
        };
    }, [shortcuts, videoElement, containerElement, controllerElement]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const pointerdown = videoEventMapRef.current.get('pointerdown');
        pointerdown && pointerdown(e);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const keydown = videoEventMapRef.current.get('keydown');
        keydown && keydown(e);
    }, []);

    return [handlePointerDown, handleKeyDown] as const;
};
