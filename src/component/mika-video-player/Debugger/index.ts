let EnableDebugger = false;

const Debugger = {
    log: (...msg: unknown[]) => {
        if (EnableDebugger) {
            console.log("[MikaVideoPlayer]", ...msg);
        }
    },
    warn: (...msg: unknown[]) => {
        if (EnableDebugger) {
            console.warn("[MikaVideoPlayer]", ...msg);
        }
    },
    error: (...msg: unknown[]) => {
        if (EnableDebugger) {
            console.error("[MikaVideoPlayer]", ...msg);
        }
    },
    setEnable: (enable: boolean) => {
        EnableDebugger = enable;
    }
};

export default Debugger;

