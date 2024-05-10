import {DanmakuAlloc} from "./DanmakuAlloc.ts";
import {getDanmakuRender, DanmakuAttr, danmakuRenderMap} from "./DanmakuRender.ts";

export interface DanmakuOption {
    'opacity': string;
    'fontFamily': string;
    'fontWeight': string;
    'textShadow': string;
}

export class Timer {
    start: number = 0;
    paused: boolean = true;
    pauseTime: number = 0;
    loop?: number;
    callbackList: {
        callback: () => void;
        delay: number;
    }[] = [];

    constructor() {
        this.start = performance.now();
        this.pauseTime = this.start;

        const loop = () => {
            if (!this.paused) {
                this.callbackList = this.callbackList.filter(({callback, delay}) => {
                    if (this.now >= delay) {
                        callback();
                        return false;
                    }
                    return true;
                });
            }
            this.loop = requestAnimationFrame(loop);
        }

        this.loop = requestAnimationFrame(loop);
    }

    public destroy() {
        cancelAnimationFrame(this.loop!);
    }

    // 获取当前时间, 单位: ms
    get now(): number {
        return this.paused ? this.pauseTime - this.start : performance.now() - this.start;
    }

    get nowSeconds(): number {
        return this.now / 1000;
    }

    public pause() {
        if (this.paused) return;
        this.paused = true;
        this.pauseTime = performance.now();
    }

    public reset() {
        this.start = performance.now();
        this.pauseTime = this.start;
        this.callbackList = [];
    }

    public resume() {
        if (!this.paused) return;
        this.paused = false;
        this.start += performance.now() - this.pauseTime;
    }

    public setTimeout(callback: () => void, delay: number) {
        this.callbackList.push({callback, delay: delay + this.now});
    }
}

const devicePixelRatio = window.devicePixelRatio;

export class DanmakuManager {
    private container?: HTMLDivElement;
    private currentDanmaku: Set<HTMLDivElement> = new Set();
    private alloc: DanmakuAlloc[] = [];
    private resizeObserver: ResizeObserver = new ResizeObserver(this.handleResize.bind(this));
    private video: HTMLVideoElement;
    private timer: Timer = new Timer();

    private canvas = document.createElement('canvas');
    private context: CanvasRenderingContext2D = this.canvas.getContext('2d')!;

    private containerWidth = 0;
    private containerHeight = 0;

    private displayAreaRate: 0.25 | 0.5 | 0.75 | 1 = 0.5;
    private fontSizeScale = 1;
    private fontSizeSyncWithWindow = true;
    private danmakuSpeed = 1;
    private danmakuOption: DanmakuOption = {
        'opacity': '0.8',
        'fontFamily': 'Arial, Helvetica, sans-serif',
        'fontWeight': 'bold',
        'textShadow': '1px 0 1px black, 0 1px 1px black, 0 -1px 1px black, -1px 0 1px black',
    };

    constructor(container: HTMLDivElement, video: HTMLVideoElement) {
        this.container = container;
        this.containerWidth = this.container!.clientWidth;
        this.containerHeight = this.container!.clientHeight;

        Object.entries(this.danmakuOption).forEach(([key, value]) => {
            this.container?.style.setProperty(key, value);
        });

        this.resizeObserver.observe(this.container);
        this.timer.resume();
        this.video = video;
        this.video.paused && this.handlePause();

        video.addEventListener('pause', this.handlePause);
        video.addEventListener('play', this.handlePlay);
        video.addEventListener('seeked', this.handleSeeked);
        video.addEventListener('ratechange', this.handleRateChange);
        video.addEventListener('ended', this.handleEnded);
        video.addEventListener('seeking', this.handleSeeking);

        // 初始化弹幕轨道调度器
        for (const mode of danmakuRenderMap.keys()) {
            this.alloc[mode] = new DanmakuAlloc(mode === 1 ? this.containerHeight * this.displayAreaRate : this.containerHeight);
        }
    }

    private hideDanmaku(element: HTMLDivElement) {
        this.currentDanmaku.delete(element);
        element.remove();
    }

    private handleResize(entries: ResizeObserverEntry[]) {
        const entry = entries[0];
        this.containerWidth = entry.contentRect.width;
        this.containerHeight = entry.contentRect.height;

        this.alloc.forEach(scheduler => {
            scheduler.ContainerHeight = this.containerHeight;
        });
        this.alloc[1].ContainerHeight = this.containerHeight * this.displayAreaRate;
    }

    private handlePause = () => {
        for (const d of this.currentDanmaku) {
            d.getAnimations().forEach(a => a.pause());
        }

        this.timer.pause();
    };

    private handlePlay = () => {
        for (const d of this.currentDanmaku) {
            d.getAnimations().forEach(a => a.play());
        }

        this.timer.resume();
    };


    private copyCurrentDanmaku: Set<HTMLDivElement> = new Set();
    private handleSeeking = () => {
        if (this.copyCurrentDanmaku.size > 0) return;

        // 暂停所有弹幕，也可以不暂停，视情况移除
        for (const d of this.currentDanmaku) {
            d.getAnimations().forEach(a => a.pause());
        }

        // 将当前弹幕保存，避免在seeking事件中清除，导致弹幕闪烁
        this.copyCurrentDanmaku = new Set(this.currentDanmaku);
        this.currentDanmaku = new Set();
        this.alloc.forEach(scheduler => {
            scheduler.clear();
        });

        this.handlePause();
        this.timer.reset();
    };

    private handleSeeked = () => {
        this.copyCurrentDanmaku.forEach(d => this.hideDanmaku(d));
        this.copyCurrentDanmaku.clear();

        if (!this.video.paused) {
            this.handlePlay();
        }
    };

    private handleRateChange = () => {
    };

    private handleEnded = () => {
        this.currentDanmaku.forEach(d => this.hideDanmaku(d));
        this.currentDanmaku.clear();

        this.alloc.forEach(scheduler => {
            scheduler.clear();
        });
    };

    public destroy() {
        this.currentDanmaku.forEach(d => d.remove);
        this.resizeObserver.disconnect();
        this.currentDanmaku.clear();

        this.container = undefined;

        this.video.removeEventListener('pause', this.handlePause);
        this.video.removeEventListener('play', this.handlePlay);
        this.video.removeEventListener('seeked', this.handleSeeked);
        this.video.removeEventListener('ratechange', this.handleRateChange);
        this.video.removeEventListener('seeking', this.handleSeeking);
        this.video.removeEventListener('ended', this.handleEnded);

        this.alloc.forEach(scheduler => {
            scheduler.clear();
        });
        this.alloc = [];

        this.timer.pause();
        this.timer.destroy();
    }

    public setDanmakuOption(option: Partial<{ [key in keyof DanmakuOption]: string }>) {
        Object.assign(this.danmakuOption, option);

        Object.entries(this.danmakuOption).forEach(([key, value]) => {
            this.container?.style.setProperty(key, value);
        });
    }

    private createDanmakuElement(danmaku: DanmakuAttr, delay: number) {
        const [width, height] = this.getTextSize(danmaku.text, this.getFontSize(danmaku.size), this.danmakuOption['fontFamily'], this.danmakuOption['fontWeight']);
        danmaku.begin = this.timer.nowSeconds;

        const d: HTMLDivElement = document.createElement('div');
        this.currentDanmaku.add(d);

        getDanmakuRender(danmaku.mode).render(d, danmaku, {
            containerWidth: this.containerWidth,
            containerHeight: this.containerHeight,
            danmakuWidth: width,
            danmakuHeight: height,
            danmakuSpeed: this.danmakuSpeed,
            alloc: this.alloc[danmaku.mode],
            delay: delay,
            fontSize: this.getFontSize(danmaku.size),
            danmakuOption: this.danmakuOption,
            timer: this.timer,
            hideDanmaku: this.hideDanmaku.bind(this),
        });


        return d;
    }

    private getFontSize(fontSize: number): number {
        let fontSizeScale = this.fontSizeScale;
        if (this.fontSizeSyncWithWindow) {
            // 1080p 为基准，缩放倍率[0.75, 1.5]
            fontSizeScale = Math.max(0.75, Math.min(1.5, this.containerHeight / 1080 * devicePixelRatio));
        }
        return fontSize * fontSizeScale;
    }

    private getTextSize(text: string, fontSize: number, fontFamily: string, fontWeight: string) {
        this.context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const size = this.context.measureText(text);
        // Firefox will return float value, but Chrome will return integer value
        return [Math.ceil(size.width), Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent + 4)] as const;
    }


    public addDanmaku(danmaku: DanmakuAttr, delay = 0) {
        const d = this.createDanmakuElement(danmaku, delay);
        d && this.container?.appendChild(d);
    }

    public addDanmakuList(danmaku: (DanmakuAttr & { delay?: number })[]) {
        const fragment = document.createDocumentFragment();
        danmaku.forEach(d => {
            const {delay, ...danmaku} = d;
            const element = this.createDanmakuElement(danmaku, delay ?? 0);
            element && fragment.appendChild(element);
        });

        this.container?.appendChild(fragment);
    }
}
