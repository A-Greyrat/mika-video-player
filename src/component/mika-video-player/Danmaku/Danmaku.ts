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
    '--top': string;
}

export interface IDanmakuPool {
    destroy(): void;

    addDanmaku(danmaku: DanmakuType): void;
}

export class DanmakuPool implements IDanmakuPool {
    #container?: HTMLDivElement;
    #availableDanmaku: HTMLDivElement[] = [];
    #currentDanmaku: Set<HTMLDivElement> = new Set();
    #tempDanmaku?: HTMLDivElement = document.createElement('div');
    #speed = 4;
    #containerWidth = 0;
    #containerHeight = 0;
    #lengthMap = new Map<string, number>();
    #heightMap = new Map<string, number>();
    #resizeObserver = new ResizeObserver(this.#handleResize.bind(this));
    #video: HTMLVideoElement;

    #displayArea: 0.25 | 0.5 | 0.75 | 1 = 0.5;
    #trackCount = 0;
    #currentTrack = 0;

    #topTrack: Set<number> = new Set();
    #bottomTrack: Set<number> = new Set();

    #defaultDanmakuOption: Pick<DanmakuOption, '--opacity' | '--fontFamily' | '--fontWeight' | '--textShadow'> = {
        '--opacity': '0.65',
        '--fontFamily': 'Arial, Helvetica, sans-serif',
        '--fontWeight': 'bold',
        '--textShadow': '1px 0 1px black, 0 1px 1px black, 0 -1px 1px black, -1px 0 1px black',
    };

    #playState: { state: 'running' | 'paused' } = {state: 'running'};

    #handleResize(entries: ResizeObserverEntry[]) {
        const entry = entries[0];
        this.#containerWidth = entry.contentRect.width;
        this.#containerHeight = entry.contentRect.height;

        this.#trackCount = Math.floor(this.#containerHeight / this.#heightMap.get('25')!) * this.#displayArea;
    }

    #handlePause = () => {
        this.#playState.state = 'paused';
        this.#container?.classList.add('mika-video-player-danmaku-container-paused');
    }

    #handlePlay = () => {
        this.#playState.state = 'running';
        this.#container?.classList.remove('mika-video-player-danmaku-container-paused');
    }

    #handleSeeked = () => {
        this.#currentDanmaku.forEach(d => {
            this.#availableDanmaku.push(d);
            d.innerText = '';
            d.style.visibility = 'hidden';
        });
        this.#currentDanmaku.clear();
        this.#currentTrack = 0;
    }

    constructor(container: HTMLDivElement, video: HTMLVideoElement) {
        this.#container = container;
        this.#video = video;

        this.#tempDanmaku!.className = 'mika-video-player-temp-danmaku';
        this.#container.appendChild(this.#tempDanmaku!);
        this.#playState.state = video.paused ? 'paused' : 'running';

        video.addEventListener('pause', this.#handlePause);
        video.addEventListener('play', this.#handlePlay);
        video.addEventListener('seeked', this.#handleSeeked);

        this.#containerWidth = this.#container!.clientWidth;
        this.#containerHeight = this.#container!.clientHeight;

        this.#resizeObserver.observe(this.#container);

        const lengthList = ['12', '16', '18', '25', '36', '45', '64'];
        lengthList.forEach(size => {
            this.#tempDanmaku!.style.fontSize = this.#calculateFontSize(size) + 'px';
            this.#tempDanmaku!.innerText = '测';
            this.#lengthMap.set(size, this.#tempDanmaku!.clientWidth);
            this.#heightMap.set(size, this.#tempDanmaku!.clientHeight);
        });

        this.#tempDanmaku!.remove();
        this.#trackCount = Math.floor(this.#containerHeight / this.#heightMap.get('25')!) * this.#displayArea;
    }

    public destroy() {
        this.#availableDanmaku.forEach(d => d.remove);
        this.#currentDanmaku.forEach(d => d.remove);

        this.#resizeObserver.disconnect();
        this.#lengthMap.clear();
        this.#heightMap.clear();

        this.#availableDanmaku = [];
        this.#currentDanmaku.clear();

        this.#container = undefined;
        this.#tempDanmaku = undefined;

        this.#video.removeEventListener('pause', this.#handlePause);
        this.#video.removeEventListener('play', this.#handlePlay);
        this.#video.removeEventListener('seeked', this.#handleSeeked);
    }

    #createDanmakuElement(danmaku: DanmakuType, danmakuOption: DanmakuOption): HTMLDivElement {
        const d = this.#availableDanmaku.length > 0 ? this.#availableDanmaku.pop()! : this.#container!.appendChild(document.createElement('div'));
        this.#currentDanmaku.add(d);

        // 暂时不支持逆向、精准定位和高级弹幕
        const danmakuType =
            danmaku.mode === '1' ? 'mika-video-player-danmaku' :
                danmaku.mode === '4' ? 'mika-video-player-danmaku-bottom' :
                    danmaku.mode === '5' ? 'mika-video-player-danmaku-top' : 'mika-video-player-danmaku';

        d.className = '';
        d.ariaLive = 'polite';
        d.style.visibility = 'visible';
        d.style.animationPlayState = this.#playState.state;

        setTimeout(() => {
            void d.offsetWidth;
            d.classList.add(danmakuType);
            d.innerText = danmaku.text;
        }, 0);

        Object.entries(danmakuOption).forEach(([key, value]) => {
            d.style.setProperty(key, value);
        });

        d.onanimationend = () => {
            if (d.className === 'mika-video-player-danmaku-bottom') {
                this.#bottomTrack.delete(Math.floor(parseFloat(danmakuOption['--top']) / 100 * (this.#trackCount / this.#displayArea)));
                console.log('delete bottom track:', Math.floor(parseFloat(danmakuOption['--top']) / 100 * (this.#trackCount / this.#displayArea)));
            } else if (d.className === 'mika-video-player-danmaku-top') {
                this.#topTrack.delete(Math.floor(parseFloat(danmakuOption['--top']) / 100 * (this.#trackCount / this.#displayArea)));
                console.log('delete top track:', Math.floor(parseFloat(danmakuOption['--top']) / 100 * (this.#trackCount / this.#displayArea)));
            }

            this.#availableDanmaku.push(d);
            this.#currentDanmaku.delete(d);
            d.innerText = '';
            d.style.visibility = 'hidden';
        };

        return d;
    }

    public setDefaultDanmakuOption(option: Pick<DanmakuOption, '--opacity' | '--fontFamily' | '--fontWeight' | '--textShadow'>) {
        this.#defaultDanmakuOption = option;
    }

    #calculateFontSize(fontSize: string): number {
        const size = parseFloat(fontSize);
        switch (size) {
            case 12:
                return 16;
            case 16:
                return 16;
            case 18:
                return 18;
            case 25:
                return 20;
            case 36:
                return 24;
            case 45:
                return 24;
            case 64:
                return 24;
            default:
                return 20;
        }
    }

    #createDanmakuOption(danmaku: DanmakuType): DanmakuOption {
        const option = {
            ...this.#defaultDanmakuOption,
            "--fontSize": this.#calculateFontSize(danmaku.size) + 'px',
            "--color": '#' + parseInt(danmaku.color).toString(16).padStart(6, '0'),

            "--offset": '',
            "--translateX": '',
            "--duration": '',
            "--top": '',
        };


        const width = this.#lengthMap.get(danmaku.size)! * danmaku.text.length;

        if (danmaku.mode === '1') {
            const duration = (this.#containerWidth + width * 2) / width * this.#speed;
            const offset = 0;
            const top = (this.#currentTrack % this.#trackCount) * 100 / (this.#trackCount / this.#displayArea) + '%';
            this.#currentTrack = (this.#currentTrack + 1) % this.#trackCount;
            const translateX = 'calc(' + this.#containerWidth + 'px)';

            option['--offset'] = offset + 'px';
            option['--translateX'] = translateX;
            option['--duration'] = duration + 's';
            option['--top'] = top;

            option['--offset'] = offset + 'px';
            option['--translateX'] = translateX;
            option['--duration'] = duration + 's';
            option['--top'] = top;
        } else if (danmaku.mode === '4') {
            const duration = '5';
            const offset = 0;

            let bottomCurrent = 0;
            for (let i = 1; ; i++) {
                if (!this.#bottomTrack.has(i)) {
                    this.#bottomTrack.add(i);
                    bottomCurrent = i;
                    break;
                }
            }
            const top = bottomCurrent / (this.#trackCount / this.#displayArea) * 100 + '%';
            const translateX = 'calc(' + (this.#containerWidth / 2 + width) + 'px)';

            option['--offset'] = offset + 'px';
            option['--translateX'] = translateX;
            option['--duration'] = duration + 's';
            option['--top'] = top;

        } else if (danmaku.mode === '5') {
            const duration = '5';
            const offset = 0;

            let topCurrent = 0;
            for (let i = 0; ; i++) {
                if (!this.#topTrack.has(i)) {
                    this.#topTrack.add(i);
                    topCurrent = i;
                    break;
                }
            }
            const top = topCurrent / (this.#trackCount / this.#displayArea) * 100 + '%';
            const translateX = 'calc(' + 0 + 'px)';

            option['--offset'] = offset + 'px';
            option['--translateX'] = translateX;
            option['--duration'] = duration + 's';
            option['--top'] = top;
        }

        return option;
    }

    public addDanmaku(danmaku: DanmakuType) {
        this.#createDanmakuElement(danmaku, this.#createDanmakuOption(danmaku));
    }

}
