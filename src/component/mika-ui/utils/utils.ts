import {useCallback, useRef} from "react";

export const withLockTime = <T extends unknown[]>(fn: (...args: T) => unknown, lockTime = 500) => {
    let locked = false;
    return (...args: T) => {
        if (locked) return;
        locked = true;
        fn.call(null, ...args);
        setTimeout(() => {
            locked = false;
        }, lockTime);
    }
}

export const withLock = <T extends unknown[]>(fn: (_lock: boolean, ...args: T) => unknown) => {
    let locked = false;
    return (...args: T) => {
        if (locked) return;
        locked = true;
        fn.call(null, locked, ...args);
    }
}

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export const debounce = <T extends unknown[]>(fn: (...args: T) => unknown, delay: number) => {
    let timer: number | null = null;
    return (...args: T) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.call(null, ...args);
            timer = null;
        }, delay);
    }
}

export const debounceAsync = <T extends unknown[]>(fn: (...args: T) => Promise<unknown>, delay: number) => {
    let timer: number | null = null;
    return (...args: T) => {
        if (timer) {
            clearTimeout(timer);
        }
        return new Promise((resolve) => {
            timer = setTimeout(async () => {
                const res = await fn.call(null, ...args);
                timer = null;
                resolve(res);
            }, delay);
        });
    };
}

export const throttle = <T extends unknown[]>(fn: (...args: T) => unknown, delay: number) => {
    let timer: number | null = null;
    return (arg: T) => {
        if (timer) {
            return;
        }
        timer = setTimeout(() => {
            fn.call(null, ...arg);
            timer = null;
        }, delay);
    }
}

export const useTimer = <T, >(callback: (arg: T) => unknown, interval: number) => {
    const timer = useRef<number>(0);

    const start = useCallback(() => {
        clearInterval(timer.current);
        timer.current = setInterval(callback, interval);
    }, [callback, interval]);

    const reset = useCallback(() => {
        if (timer.current) {
            clearInterval(timer.current);
            timer.current = setInterval(callback, interval);
        }
    }, [callback, interval]);

    const stop = useCallback(() => {
        clearInterval(timer.current);
        timer.current = 0;
    }, []);

    return interval > 0 ? [start, stop, reset] : [() => {
    }, () => {
    }, () => {
    }];
}