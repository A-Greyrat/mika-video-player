import Debugger from "../Debugger";
import {DanmakuScheduler, Interval} from "./DanmakuScheduler.ts";

export interface DanmakuType {
    // '弹幕出现的时间'
    begin: number;
    // '1: 普通弹幕 4: 底部弹幕 5: 顶部弹幕 6: 逆向弹幕 7: 精准定位 8: 高级弹幕'
    mode: string;
    // '12: 非常小 16: 特小 18: 小 25: 中 36: 大 45: 很大 64: 特别大'
    size: string;
    // '弹幕颜色'
    color: string;
    // '用户发送弹幕的时间'
    time: string;
    // '0: 普通池 1: 字幕池 2: 特殊池'
    pool: string;
    // '弹幕内容'
    text: string;
}

export interface DanmakuOption {
    '--opacity': string;
    '--fontSize': string;
    '--fontFamily': string;
    '--fontWeight': string;
    '--textShadow': string;
    '--color': string;
    '--offset': string;
    '--translateX': string;
    '--duration': string;
    '--offsetY': string;
}

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

type ContainerOption = "--opacity" | "--fontFamily" | "--fontWeight" | "--textShadow";

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
    #danmakuSpeed = 1;
    #fontSizeScale = 0.8;
    #defaultDanmakuOption: Pick<DanmakuOption, ContainerOption> = {
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

        // 初始化3种弹幕轨道调度器，0 - 普通、1 - 底部、2 - 顶部
        for (let i = 0; i < 3; i++) {
            this.#schedulers.push(new DanmakuScheduler(i === 0 ? (this.#containerHeight * this.#displayAreaRate) : this.#containerHeight));
        }
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
        this.#currentDanmaku.forEach(d => {
            this.#availableDanmaku.push(d);
            // d.innerText = '';
            // d.style.opacity = '0';
            d.style.setProperty('content-visibility', 'hidden');
            d.className = '';
        });
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

    public setDefaultDanmakuOption(option: Pick<DanmakuOption, '--opacity' | '--fontFamily' | '--fontWeight' | '--textShadow'>) {
        this.#defaultDanmakuOption = option;

        Object.entries(this.#defaultDanmakuOption).forEach(([key, value]) => {
            this.#container?.style.setProperty(key, value);
        });
    }

    #createDanmakuElement(danmaku: DanmakuType, danmakuOption: Omit<DanmakuOption, ContainerOption>) {
        if (danmakuOption['--offsetY'] === '-1px') {
            Debugger.log('弹幕‘' + danmaku.text + '’超出容器范围, 丢弃');
            return;
        }

        // 暂时不支持逆向、精准定位和高级弹幕
        const danmakuType =
            danmaku.mode === '1' ? 'mika-video-player-danmaku' :
                danmaku.mode === '4' ? 'mika-video-player-danmaku-bottom' :
                    danmaku.mode === '5' ? 'mika-video-player-danmaku-top' : 'mika-video-player-danmaku-unknown';

        if (danmakuType === 'mika-video-player-danmaku-unknown') {
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
        }

        this.#currentDanmaku.add(d);

        d.style.setProperty('content-visibility', 'auto');
        // d.style.opacity = this.#defaultDanmakuOption['--opacity'];
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                d.innerText = danmaku.text;
                d.classList.add(danmakuType);
            });
        });

        Object.entries(danmakuOption).forEach(([key, value]) => {
            d.style.setProperty(key, value);
        });

        d.onanimationend = () => {
            this.#availableDanmaku.push(d);
            this.#currentDanmaku.delete(d);
            d.style.setProperty('content-visibility', 'hidden');
            // d.style.opacity = '0';
            d.className = '';
        };
    }

    #getFontSize(fontSize: string): number {
        const size = parseFloat(fontSize);
        return size * this.#fontSizeScale;
    }

    #getVelocity(width: number): number {
        return (40 * Math.log10(width) + 100) * this.#danmakuSpeed;
    }

    #getTextSize(text: string, fontSize: number, fontFamily: string, fontWeight: string) {
        this.#context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const size = this.#context.measureText(text);
        // Firefox will return float value, but Chrome will return integer value
        return [Math.ceil(size.width), Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent + 4)] as const;
    }

    #getDanmakuOption(danmaku: DanmakuType): Omit<DanmakuOption, ContainerOption> {
        const option: Omit<DanmakuOption, ContainerOption> = {
            "--fontSize": this.#getFontSize(danmaku.size) + 'px',
            "--color": '#' + parseInt(danmaku.color).toString(16).padStart(6, '0'),

            "--offset": '',
            "--translateX": '',
            "--duration": '',
            "--offsetY": '',
        };

        const [width, height] = this.#getTextSize(danmaku.text, this.#getFontSize(danmaku.size), this.#defaultDanmakuOption['--fontFamily'], this.#defaultDanmakuOption['--fontWeight']);

        let duration = 5;
        const offset = 0;
        let translateX = '0';
        danmaku.begin = this.#timer.now / 1000;
        if (danmaku.mode === '1') {
            duration = (this.#containerWidth + width) / this.#getVelocity(width);
            translateX = 'calc(' + this.#containerWidth + 'px)';

            const comparer = (a: Interval, danmaku: DanmakuType) => {
                const delta = a.start + a.duration - danmaku.begin;
                return delta * this.#getVelocity(a.width) <= this.#containerWidth && // 前弹幕以及完全进入屏幕
                    delta * this.#getVelocity(width) <= this.#containerWidth; // 在当前弹幕消失前，新弹幕不会追上前弹幕
            };

            option['--offsetY'] = this.#schedulers[0].getAvailableTrack(danmaku, duration, width, height, comparer) + 'px';
        } else if (danmaku.mode === '4') {
            option['--offsetY'] = this.#schedulers[1].getAvailableTrack(danmaku, duration, width, height) + 'px';
        } else if (danmaku.mode === '5') {
            option['--offsetY'] = this.#schedulers[2].getAvailableTrack(danmaku, duration, width, height) + 'px';
        }

        option['--offset'] = offset + 'px';
        option['--translateX'] = translateX;
        option['--duration'] = duration + 's';
        return option;
    }

    public addDanmaku(danmaku: DanmakuType) {
        this.#createDanmakuElement(danmaku, this.#getDanmakuOption(danmaku));
    }

}
