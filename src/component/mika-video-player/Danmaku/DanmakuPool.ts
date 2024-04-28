import {DanmakuScheduler} from "./DanmakuScheduler.ts";
import {DanmakuAttr} from "./Danmaku.ts";

import Debugger from "../Debugger";
import DanmakuTypeMap from "./Danmaku.ts";

// 需要动态计算的弹幕参数
export interface DanmakuParam {
    '--translateX': string;
    '--duration': string;
    '--offsetX': string;
    '--offsetY': string;
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

    constructor() {
        this.#start = performance.now();
        this.#pauseTime = this.#start;
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
}


export class DanmakuPool {
    #container?: HTMLDivElement;
    #availableDanmaku: HTMLDivElement[] = [];
    #currentDanmaku: Set<HTMLDivElement> = new Set();
    #schedulers: DanmakuScheduler[] = [];
    #resizeObserver: ResizeObserver = new ResizeObserver(this.#handleResize.bind(this));
    #video: HTMLVideoElement;
    #timer: Timer = new Timer();

    #canvas = document.createElement('canvas');
    #context: CanvasRenderingContext2D = this.#canvas.getContext('2d')!;

    #playState: { state: 'running' | 'paused' } = {state: 'running'};
    #videoSpeed = 1;
    #containerWidth = 0;
    #containerHeight = 0;

    #displayAreaRate: 0.25 | 0.5 | 0.75 | 1 = 1;
    #fontSizeScale = 0.8;
    #defaultDanmakuOption = {
        '--opacity': '0.8',
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

        this.#playState.state = video.paused ? 'paused' : 'running';
        video.addEventListener('pause', this.#handlePause);
        video.addEventListener('play', this.#handlePlay);
        video.addEventListener('seeked', this.#handleSeeked);
        video.addEventListener('ratechange', this.#handleRateChange);
        video.addEventListener('ended', this.#handleSeeked);

        // 初始化弹幕轨道调度器
        for (let i = 0; i < DanmakuTypeMap.size; i++) {
            this.#schedulers.push(new DanmakuScheduler(i === 0 ? (this.#containerHeight * this.#displayAreaRate) : this.#containerHeight));
        }

        let index = 0;
        DanmakuTypeMap.forEach((danmakuType, _i) => {
            danmakuType.scheduler = this.#schedulers[index++];
            danmakuType.containerWidth = this.#containerWidth;
        });
    }

    #hideDanmaku(element: HTMLDivElement) {
        this.#availableDanmaku.push(element);
        this.#currentDanmaku.delete(element);
        // element.style.setProperty('content-visibility', 'hidden');
        element.style.opacity = '0';
        element.className = '';
    }

    #handleResize(entries: ResizeObserverEntry[]) {
        const entry = entries[0];
        this.#containerWidth = entry.contentRect.width;
        this.#containerHeight = entry.contentRect.height;

        this.#schedulers.forEach(scheduler => {
            scheduler.clear();
            scheduler.ContainerHeight = this.#containerHeight;
        });
        this.#schedulers[0].ContainerHeight = this.#containerHeight * this.#displayAreaRate;

        DanmakuTypeMap.forEach((danmakuType, _i) => {
            danmakuType.containerWidth = this.#containerWidth;
        });
    }

    #handlePause = () => {
        this.#playState.state = 'paused';
        this.#container?.classList.add('mika-video-player-danmaku-container-paused');
        this.#timer.pause();
    }

    #handlePlay = () => {
        this.#playState.state = 'running';
        this.#container?.classList.remove('mika-video-player-danmaku-container-paused');
        this.#timer.resume();
    }

    #handleSeeked = () => {
        this.#currentDanmaku.forEach(d => this.#hideDanmaku(d));
        this.#currentDanmaku.clear();

        this.#schedulers.forEach(scheduler => {
            scheduler.clear();
        });
    }

    #handleRateChange = () => {
        this.#videoSpeed = this.#video.playbackRate;
        this.#schedulers.forEach(scheduler => {
            scheduler.VideoSpeed = this.#videoSpeed;
        });
    }

    public destroy() {
        this.#availableDanmaku.forEach(d => d.remove);
        this.#currentDanmaku.forEach(d => d.remove);

        this.#resizeObserver.disconnect();

        this.#availableDanmaku = [];
        this.#currentDanmaku.clear();

        this.#container = undefined;

        this.#video.removeEventListener('pause', this.#handlePause);
        this.#video.removeEventListener('play', this.#handlePlay);
        this.#video.removeEventListener('seeked', this.#handleSeeked);
        this.#video.removeEventListener('ratechange', this.#handleRateChange);

        this.#schedulers = [];
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
        if (this.#availableDanmaku.length > 0) {
            d = this.#availableDanmaku.pop()!;
        } else {
            d = this.#container!.appendChild(document.createElement('div'));
            d.ariaLive = 'polite';
            d.style.position = 'absolute';
            d.style.whiteSpace = 'nowrap';
            d.style.overflow = 'hidden';
            d.style.pointerEvents = 'none';
            d.style.willChange = 'transform, opacity';
            d.style.opacity = this.#defaultDanmakuOption['--opacity'];
            d.style.setProperty('content-visibility', 'auto');
            d.onanimationend = () => this.#hideDanmaku(d);
        }

        this.#currentDanmaku.add(d);

        // d.style.setProperty('content-visibility', 'auto');
        d.style.opacity = this.#defaultDanmakuOption['--opacity'];
        d.classList.add(danmakuType);
        d.innerText = danmaku.text;

        Object.entries(danmakuParam).forEach(([key, value]) => {
            d.style.setProperty(key, value);
        });
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

    #getDanmakuOption(danmaku: DanmakuAttr): Omit<DanmakuOption, ContainerOption> {
        const option: Omit<DanmakuOption, ContainerOption> = {
            "--fontSize": this.#getFontSize(danmaku.size) + 'px',
            "--color": '#' + parseInt(danmaku.color).toString(16).padStart(6, '0'),

            "--translateX": '',
            "--duration": '',
            "--offsetX": '',
            "--offsetY": '',
        };

        const [width, height] = this.#getTextSize(danmaku.text, this.#getFontSize(danmaku.size), this.#defaultDanmakuOption['--fontFamily'], this.#defaultDanmakuOption['--fontWeight']);
        danmaku.begin = this.#timer.now / 1000;

        return {
            ...option,
            ...DanmakuTypeMap.get(parseInt(danmaku.mode))?.getDanmakuParam(danmaku, width, height)
        }
    }

    public addDanmaku(danmaku: DanmakuAttr) {
        this.#createDanmakuElement(danmaku, this.#getDanmakuOption(danmaku));
    }
}
