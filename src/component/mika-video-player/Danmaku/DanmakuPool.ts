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
    #callbackList: {
        callback: () => void;
        delay: number;
    }[] = [];

    constructor() {
        this.#start = performance.now();
        this.#pauseTime = this.#start;

        const loop = () => {
            if (!this.#paused) {
                this.#callbackList = this.#callbackList.filter(({callback, delay}) => {
                    if (this.now >= delay) {
                        callback();
                        return false;
                    }
                    return true;
                });
            }
            requestAnimationFrame(loop);
        }

        loop();
    }

    // 获取当前时间, 单位: ms
    get now(): number {
        return this.#paused ? this.#pauseTime - this.#start : performance.now() - this.#start;
    }

    get nowSeconds(): number {
        return this.now / 1000;
    }

    public pause() {
        if (this.#paused) return;
        this.#paused = true;
        this.#pauseTime = performance.now();
    }

    public reset() {
        this.#start = performance.now();
        this.#pauseTime = this.#start;
        this.#callbackList = [];
    }

    public resume() {
        if (!this.#paused) return;
        this.#paused = false;
        this.#start += performance.now() - this.#pauseTime;
    }

    public setTimeout(callback: () => void, delay: number) {
        this.#callbackList.push({callback, delay: delay + this.now});
    }
}

export class DanmakuPool {
    #container?: HTMLDivElement;
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
        this.#currentDanmaku.delete(element);
        element.remove();
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
        this.#timer.reset();
    };

    #handleSeeked = () => {
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
        this.#currentDanmaku.forEach(d => d.remove);
        this.#resizeObserver.disconnect();
        this.#currentDanmaku.clear();

        this.#container = undefined;

        this.#video.removeEventListener('pause', this.#handlePause);
        this.#video.removeEventListener('play', this.#handlePlay);
        this.#video.removeEventListener('seeked', this.#handleSeeked);
        this.#video.removeEventListener('ratechange', this.#handleRateChange);
        this.#video.removeEventListener('seeking', this.#handleSeeking);
        this.#video.removeEventListener('ended', this.#handleEnded);

        this.#alloc.forEach(scheduler => {
            scheduler.clear();
        });
        this.#alloc = [];
        this.#timer.pause();
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

        const danmakuType = DanmakuTypeMap.get(danmaku.mode)?.getDanmakuCSSClass();
        if (!danmakuType) {
            Debugger.warn('不支持的弹幕类型: ' + danmaku.mode);
            return;
        }

        const d: HTMLDivElement = document.createElement('div');
        d.ariaLive = 'polite';
        d.classList.add('mika-video-player-danmaku');
        d.classList.add(danmakuType);
        d.style.opacity = '0';
        d.innerText = danmaku.text;

        Object.entries(danmakuParam).forEach(([key, value]) => {
            d.style.setProperty(key, value);
        });

        this.#currentDanmaku.add(d);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                d.style.opacity = 'var(--opacity)';
                d.classList.add('mika-video-player-danmaku-animation');
                this.#timer.setTimeout(() => this.#hideDanmaku(d), (parseFloat(danmakuParam['--duration']) - parseFloat(danmakuParam['--delay'])) * 1000);

                // TODO: 待重构
                // TODO: 增加animation-delay前的透明度衰减
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                if (danmaku.mode === 7 && danmakuParam['--opacityMiddle'] !== danmakuParam['--opacityEnd'] && parseFloat(danmakuParam['--delay']) + parseFloat(danmakuParam['--animationDuration']) / 1000 < parseFloat(danmakuParam['--duration'])) {
                    d.style.opacity = '';
                    d.onanimationend = () => {
                        // 动画结束后，继续未完成的opacity衰减
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const duration = parseFloat(danmakuParam['--duration']) - parseFloat(danmakuParam['--animationDuration']) / 1000 - parseFloat(danmakuParam['--delay']);
                        d.classList.remove('mika-video-player-danmaku-animation');
                        d.style.opacity = 'var(--opacityMiddle)';
                        d.style.transform = 'matrix3d(var(--matrixEnd))';
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                d.style.animation = `mika-video-player-danmaku-advanced-opacity ${duration}s linear forwards`;
                            });
                        });
                    }
                }

            });
        });

        return d;
    }

    #getFontSize(fontSize: number): number {
        return fontSize * this.#fontSizeScale;
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
            "--color": danmaku.color,

            "--translateX": '',
            "--duration": '',
            "--offsetY": '',
            "--delay": '',
        };

        let [width, height] = this.#getTextSize(danmaku.text, this.#getFontSize(danmaku.size), this.#defaultDanmakuOption['--fontFamily'], this.#defaultDanmakuOption['--fontWeight']);
        danmaku.begin = this.#timer.nowSeconds;

        // TODO: 待重构
        if (danmaku.mode === 7) {
            width = this.#containerWidth;
            height = this.#containerHeight;
        }

        return {
            ...option,
            ...DanmakuTypeMap.get(danmaku.mode)?.getDanmakuParam(danmaku, width, height, delay)
        }
    }

    public addDanmaku(danmaku: DanmakuAttr, delay = 0) {
        const d = this.#createDanmakuElement(danmaku, this.#getDanmakuOption(danmaku, delay));
        d && this.#container?.appendChild(d);
    }

    public addDanmakuList(danmaku: (DanmakuAttr & { delay?: number })[]) {
        const fragment = document.createDocumentFragment();
        danmaku.forEach(d => {
            const element = this.#createDanmakuElement(d as unknown as DanmakuAttr, this.#getDanmakuOption(d as unknown as DanmakuAttr, d.delay ?? 0));
            element && fragment.appendChild(element);
        });

        this.#container?.appendChild(fragment);
    }
}
