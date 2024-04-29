import {DanmakuAlloc} from "./DanmakuAlloc.ts";
import DanmakuTypeMap, {DanmakuAttr} from "./Danmaku.ts";

import Debugger from "../Debugger";

// 需要动态计算的弹幕参数
export interface DanmakuParam {
    '--translateX': string;
    '--duration': string;
    '--offsetY': string;
    '--delay': string;
}

// 包含静态属性的弹幕参数
export interface DanmakuOption extends DanmakuParam {
    '--opacity': string;
    '--fontSize': string;
    '--color': string;
}

type ContainerOption = "--opacity" | "--fontFamily" | "--fontWeight" | "--textShadow";

class Timer {
    #start: number = 0;
    #paused: boolean = true;
    #pauseTime: number = 0;
    #callbacks: {
        callback: () => void;
        delay: number;
    }[] = [];

    constructor() {
        this.#start = performance.now();
        this.#pauseTime = this.#start;

        const loop = () => {
            if (this.#paused) return;
            while (this.#callbacks.length > 0 && this.now >= this.#callbacks[0].delay) {
                this.#callbacks.shift()!.callback();
            }
            requestAnimationFrame(loop);
        }
    }

    get now(): number {
        return this.#paused ? this.#pauseTime - this.#start : performance.now() - this.#start;
    }

    public pause() {
        if (this.#paused) return;
        this.#paused = true;
        this.#pauseTime = performance.now();
    }

    public resume() {
        if (!this.#paused) return;
        this.#paused = false;
        this.#start += performance.now() - this.#pauseTime;
    }

    public setTimeout(callback: () => void, delay: number) {
        this.#callbacks.push({callback, delay});
    }
}


export class DanmakuPool {
    #container?: HTMLDivElement;
    #availableDanmaku: Map<string, HTMLDivElement[]> = new Map();
    #currentDanmaku: Set<HTMLDivElement> = new Set();
    #alloc: DanmakuAlloc[] = [];
    #resizeObserver: ResizeObserver = new ResizeObserver(this.#handleResize.bind(this));
    #video: HTMLVideoElement;
    #timer: Timer = new Timer();

    #canvas = document.createElement('canvas');
    #context: CanvasRenderingContext2D = this.#canvas.getContext('2d')!;

    #videoSpeed = 1;
    #containerWidth = 0;
    #containerHeight = 0;

    #displayAreaRate: 0.25 | 0.5 | 0.75 | 1 = 1;
    #fontSizeScale = 1;
    #defaultDanmakuOption = {
        '--opacity': '0.65',
        '--fontFamily': 'Arial, Helvetica, sans-serif',
        '--fontWeight': 'bold',
        '--textShadow': '1px 0 1px black, 0 1px 1px black, 0 -1px 1px black, -1px 0 1px black',
    };

    constructor(container: HTMLDivElement, video: HTMLVideoElement) {
        this.#container = container;
        this.#containerWidth = this.#container!.clientWidth;
        this.#containerHeight = this.#container!.clientHeight;

        Object.entries(this.#defaultDanmakuOption).forEach(([key, value]) => {
            this.#container?.style.setProperty(key, value);
        });

        this.#resizeObserver.observe(this.#container);
        this.#timer.resume();
        this.#video = video;
        this.#video.paused && this.#handlePause();

        video.addEventListener('pause', this.#handlePause);
        video.addEventListener('play', this.#handlePlay);
        video.addEventListener('seeked', this.#handleSeeked);
        video.addEventListener('ratechange', this.#handleRateChange);
        video.addEventListener('ended', this.#handleEnded);
        video.addEventListener('seeking', this.#handleSeeking);

        // 初始化弹幕轨道调度器
        for (let i = 0; i < DanmakuTypeMap.size; i++) {
            this.#alloc.push(new DanmakuAlloc(i === 0 ? (this.#containerHeight * this.#displayAreaRate) : this.#containerHeight));
        }

        let index = 0;
        DanmakuTypeMap.forEach((danmakuType, _i) => {
            danmakuType.alloc = this.#alloc[index++];
            danmakuType.containerWidth = this.#containerWidth;
        });
    }

    #hideDanmaku(element: HTMLDivElement) {
        this.#availableDanmaku.set(element.className, (this.#availableDanmaku.get(element.className) || []).concat(element));
        this.#currentDanmaku.delete(element);
        // element.remove();
        // element.remove();
        // element.style.setProperty('content-visibility', 'hidden');
        element.style.setProperty('--opacity', '0');
        element.classList.remove('mika-video-player-danmaku-animation');
        element.innerText = '';
    }

    #handleResize(entries: ResizeObserverEntry[]) {
        const entry = entries[0];
        this.#containerWidth = entry.contentRect.width;
        this.#containerHeight = entry.contentRect.height;

        this.#alloc.forEach(scheduler => {
            scheduler.clear();
            scheduler.ContainerHeight = this.#containerHeight;
        });
        this.#alloc[0].ContainerHeight = this.#containerHeight * this.#displayAreaRate;

        DanmakuTypeMap.forEach((danmakuType, _i) => {
            danmakuType.containerWidth = this.#containerWidth;
        });
    }

    #handlePause = () => {
        this.#container?.classList.add('mika-video-player-danmaku-container-paused');
        this.#timer.pause();
    };

    #handlePlay = () => {
        this.#container?.classList.remove('mika-video-player-danmaku-container-paused');
        this.#timer.resume();
    };


    #copyCurrentDanmaku: Set<HTMLDivElement> = new Set();
    #handleSeeking = () => {
        if (this.#copyCurrentDanmaku.size > 0) return;

        // 将当前弹幕保存，避免在seeking事件中清除，导致弹幕闪烁
        this.#copyCurrentDanmaku = new Set(this.#currentDanmaku);
        this.#currentDanmaku = new Set();
        this.#alloc.forEach(scheduler => {
            scheduler.clear();
        });

        this.#handlePause();
    };

    #handleSeeked = () => {
        console.log(this.#copyCurrentDanmaku)
        this.#copyCurrentDanmaku.forEach(d => this.#hideDanmaku(d));
        this.#copyCurrentDanmaku.clear();
        if (!this.#video.paused) {
            this.#handlePlay();
        }
    };

    #handleRateChange = () => {
        this.#videoSpeed = this.#video.playbackRate;
        this.#alloc.forEach(scheduler => {
            scheduler.VideoSpeed = this.#videoSpeed;
        });
    };

    #handleEnded = () => {
        this.#currentDanmaku.forEach(d => this.#hideDanmaku(d));
        this.#currentDanmaku.clear();

        this.#alloc.forEach(scheduler => {
            scheduler.clear();
        });
    };

    public destroy() {
        this.#availableDanmaku.forEach(danmakuList => danmakuList.forEach(d => d.remove()));
        this.#currentDanmaku.forEach(d => d.remove);

        this.#resizeObserver.disconnect();

        this.#availableDanmaku.clear();
        this.#currentDanmaku.clear();

        this.#container = undefined;

        this.#video.removeEventListener('pause', this.#handlePause);
        this.#video.removeEventListener('play', this.#handlePlay);
        this.#video.removeEventListener('seeked', this.#handleSeeked);
        this.#video.removeEventListener('ratechange', this.#handleRateChange);
        this.#video.removeEventListener('seeking', this.#handleSeeking);
        this.#video.removeEventListener('ended', this.#handleEnded);

        this.#alloc = [];
    }

    public setDefaultDanmakuOption(option: { [key in ContainerOption]: string } & { [key: string]: string }) {
        this.#defaultDanmakuOption = option;

        Object.entries(this.#defaultDanmakuOption).forEach(([key, value]) => {
            this.#container?.style.setProperty(key, value);
        });
    }

    #createDanmakuElement(danmaku: DanmakuAttr, danmakuParam: DanmakuParam) {
        if (danmakuParam['--offsetY'] === '-1px') {
            Debugger.log('弹幕‘' + danmaku.text + '’超出容器范围, 丢弃');
            return;
        }

        // 暂时不支持逆向、精准定位和高级弹幕
        const danmakuType = DanmakuTypeMap.get(parseInt(danmaku.mode))?.getDanmakuCSSClass();
        if (!danmakuType) {
            Debugger.warn('不支持的弹幕类型: ' + danmaku.mode);
            return;
        }

        let d: HTMLDivElement;
        if (this.#availableDanmaku.has(danmakuType) && this.#availableDanmaku.get(danmakuType)!.length > 0) {
            d = this.#availableDanmaku.get(danmakuType)!.shift()!;
        } else {
            d = document.createElement('div');
            d.ariaLive = 'polite';
            d.classList.add('mika-video-player-danmaku');
            d.classList.add(danmakuType);
        }

        this.#currentDanmaku.add(d);

        d.style.opacity = '0';
        d.innerText = danmaku.text;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                d.style.opacity = 'var(--opacity)';
                d.classList.add('mika-video-player-danmaku-animation');
            });
        });

        Object.entries(danmakuParam).forEach(([key, value]) => {
            d.style.setProperty(key, value);
        });

        return d;
    }

    #getFontSize(fontSize: string): number {
        const size = parseFloat(fontSize);
        return size * this.#fontSizeScale;
    }

    #getTextSize(text: string, fontSize: number, fontFamily: string, fontWeight: string) {
        this.#context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const size = this.#context.measureText(text);
        // Firefox will return float value, but Chrome will return integer value
        return [Math.ceil(size.width), Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent + 4)] as const;
    }

    #getDanmakuOption(danmaku: DanmakuAttr, delay: number): Omit<DanmakuOption, ContainerOption> {
        const option: Omit<DanmakuOption, ContainerOption> = {
            "--fontSize": this.#getFontSize(danmaku.size) + 'px',
            "--color": '#' + parseInt(danmaku.color).toString(16).padStart(6, '0'),

            "--translateX": '',
            "--duration": '',
            "--offsetY": '',
            "--delay": '',
        };

        const [width, height] = this.#getTextSize(danmaku.text, this.#getFontSize(danmaku.size), this.#defaultDanmakuOption['--fontFamily'], this.#defaultDanmakuOption['--fontWeight']);
        danmaku.begin = this.#timer.now / 1000;

        return {
            ...option,
            ...DanmakuTypeMap.get(parseInt(danmaku.mode))?.getDanmakuParam(danmaku, width, height, delay)
        }
    }

    public addDanmaku(danmaku: DanmakuAttr, delay = 0) {
        const d = this.#createDanmakuElement(danmaku, this.#getDanmakuOption(danmaku, delay));
        d && this.#container?.appendChild(d);
    }

    public addDanmakuList(danmaku: (DanmakuAttr & { delay: number })[]) {
        const fragment = document.createDocumentFragment();
        danmaku.forEach(d => {
            const element = this.#createDanmakuElement(d as unknown as DanmakuAttr, this.#getDanmakuOption(d as unknown as DanmakuAttr, d.delay));
            element && fragment.appendChild(element);
        });

        this.#container?.appendChild(fragment);
    }
}
