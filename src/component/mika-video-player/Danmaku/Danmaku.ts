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


interface Interval {
    left: number;
    right: number;

    // 可用时间段
    end: number;
    // 长度
    width: number;
    // 高度
    height: number;
}

class DanmakuScheduler {
    #containerHeight: number;
    #heightMap = new Map<string, number>();
    #trackList: Interval[][] = [];

    constructor(height: number, heightMap: Map<string, number>) {
        this.#containerHeight = height;
        this.#heightMap = heightMap;
    }

    set ContainerHeight(height: number) {
        this.#containerHeight = height;

        // 重新计算轨道, 如果轨道超出容器高度则回收
        this.#trackList.forEach((trackList, _trackListIndex) => {
            for (let i = 0; i < trackList.length; i++) {
                if (trackList[i].right > this.#containerHeight) {
                    trackList.splice(i, 1);
                    i--;
                }
            }
        });
    }

    #isFree(track: Interval, danmaku: DanmakuType): boolean {
        return track.end <= danmaku.begin;
    }

    #recycleTrack(index: number, danmaku: DanmakuType, trackListIndex: number, compare: (a: Interval, danmaku: DanmakuType) => boolean) {
        if (index + 1 < this.#trackList[trackListIndex].length && compare(this.#trackList[trackListIndex][index + 1], danmaku)) {
            this.#trackList[trackListIndex][index].right = this.#trackList[trackListIndex][index + 1].right;
            this.#trackList[trackListIndex].splice(index + 1, 1);
            return true;
        }
        return false;
    }

    #size = (danmaku: Interval) => danmaku.right - danmaku.left;


    // 返回距离零点的距离，并把轨道新增到轨道列表中
    public getAvailableTrack(danmaku: DanmakuType, duration: number, compare?: (a: Interval, danmaku: DanmakuType) => boolean): number {
        const _getAvailableTrack = (danmaku: DanmakuType, duration: number, trackListIndex: number, compare: (a: Interval, danmaku: DanmakuType) => boolean): number => {
            if (trackListIndex >= this.#trackList.length) {
                this.#trackList.push([]);
            }

            const list = this.#trackList[trackListIndex];

            // 首次适应算法
            for (let i = 0; i < list.length; i++) {
                if (!compare(list[i], danmaku)) {
                    continue;
                }

                if (this.#size(list[i]) === this.#heightMap.get(danmaku.size)!) {
                    list[i].end = danmaku.begin + duration;
                    return list[i].left;
                }

                if (this.#size(list[i]) > this.#heightMap.get(danmaku.size)!) {
                    const right = list[i].right;
                    list[i].right = list[i].left + this.#heightMap.get(danmaku.size)!;
                    list[i].end = danmaku.begin + duration;
                    list.splice(i + 1, 0, {
                        left: list[i].right,
                        right: right,
                        end: 0,
                        width: this.#heightMap.get(danmaku.size)! * danmaku.text.length,
                        height: this.#heightMap.get(danmaku.size)!
                    });

                    return list[i].left;
                }

                if (this.#recycleTrack(i, danmaku, trackListIndex, compare)) i--;
            }

            const right = list.length > 0 ? list[list.length - 1].right : 0;
            if (right + this.#heightMap.get(danmaku.size)! > this.#containerHeight) {
                return _getAvailableTrack(danmaku, duration, trackListIndex + 1, compare);
            }

            list.push({
                left: right,
                right: right + this.#heightMap.get(danmaku.size)!,
                end: danmaku.begin + duration,
                width: this.#heightMap.get(danmaku.size)! * danmaku.text.length,
                height: this.#heightMap.get(danmaku.size)!
            });

            return right;
        }
        return _getAvailableTrack(danmaku, duration, 0, compare || this.#isFree);
    }

    public clear() {
        this.#trackList = [];
    }
}

export class DanmakuPool {
    #container?: HTMLDivElement;
    #availableDanmaku: HTMLDivElement[] = [];
    #currentDanmaku: Set<HTMLDivElement> = new Set();
    #tempDanmaku?: HTMLDivElement = document.createElement('div');

    #speed = 8;
    #fontSizeScale = 1;
    #videoSpeed = 1;

    #containerWidth = 0;
    #containerHeight = 0;
    #widthMap = new Map<string, number>();
    #heightMap = new Map<string, number>();
    #resizeObserver = new ResizeObserver(this.#handleResize.bind(this));
    #video: HTMLVideoElement;

    #displayArea: 0.25 | 0.5 | 0.75 | 1 = 0.75;

    #schedulers: DanmakuScheduler[] = [];

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

        this.#schedulers.forEach(scheduler => {
            scheduler.ContainerHeight = this.#containerHeight;
        });

        this.#schedulers[0].ContainerHeight = this.#containerHeight * this.#displayArea;
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

        this.#schedulers.forEach(scheduler => {
            scheduler.clear();
        });
    }

    #handleRateChange = () => {
        this.#videoSpeed = this.#video.playbackRate;
    }

    constructor(container: HTMLDivElement, video: HTMLVideoElement) {
        this.#container = container;
        this.#video = video;

        this.#tempDanmaku!.className = 'mika-video-player-temp-danmaku';
        this.#container?.appendChild(this.#tempDanmaku!);
        this.#playState.state = video.paused ? 'paused' : 'running';

        video.addEventListener('pause', this.#handlePause);
        video.addEventListener('play', this.#handlePlay);
        video.addEventListener('seeked', this.#handleSeeked);
        video.addEventListener('ratechange', this.#handleRateChange);

        this.#containerWidth = this.#container!.clientWidth;
        this.#containerHeight = this.#container!.clientHeight;

        this.#resizeObserver.observe(this.#container);

        const lengthList = ['12', '16', '18', '25', '36', '45', '64'];
        this.#tempDanmaku!.style.fontFamily = this.#defaultDanmakuOption['--fontFamily'];
        this.#tempDanmaku!.style.fontWeight = this.#defaultDanmakuOption['--fontWeight'];
        this.#tempDanmaku!.style.textShadow = this.#defaultDanmakuOption['--textShadow'];
        this.#tempDanmaku!.style.width = 'fit-content';
        lengthList.forEach(size => {
            this.#tempDanmaku!.style.fontSize = this.#calculateFontSize(size) + 'px';
            this.#tempDanmaku!.innerText = '测';
            this.#widthMap.set(size, this.#tempDanmaku!.offsetWidth);
            this.#heightMap.set(size, this.#tempDanmaku!.offsetHeight);
        });

        this.#tempDanmaku!.remove();

        // 初始化3种弹幕轨道调度器，0 - 普通、1 - 底部、2 - 顶部
        for (let i = 0; i < 3; i++) {
            this.#schedulers.push(new DanmakuScheduler(i === 0 ? (this.#containerHeight * this.#displayArea) : this.#containerHeight, this.#heightMap));
        }
    }

    public destroy() {
        this.#availableDanmaku.forEach(d => d.remove);
        this.#currentDanmaku.forEach(d => d.remove);

        this.#resizeObserver.disconnect();
        this.#widthMap.clear();
        this.#heightMap.clear();

        this.#availableDanmaku = [];
        this.#currentDanmaku.clear();

        this.#container = undefined;
        this.#tempDanmaku = undefined;

        this.#video.removeEventListener('pause', this.#handlePause);
        this.#video.removeEventListener('play', this.#handlePlay);
        this.#video.removeEventListener('seeked', this.#handleSeeked);
        this.#video.removeEventListener('ratechange', this.#handleRateChange);

        this.#schedulers = [];
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

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                d.classList.add(danmakuType);
                d.innerText = danmaku.text;
            });
        });

        Object.entries(danmakuOption).forEach(([key, value]) => {
            d.style.setProperty(key, value);
        });

        d.onanimationend = () => {
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
        return size * this.#fontSizeScale;
    }

    #calculateVelocity(width: number): number {
        return Math.sqrt(width) * this.#speed;
    }

    #createDanmakuOption(danmaku: DanmakuType): DanmakuOption {
        const option = {
            ...this.#defaultDanmakuOption,
            "--fontSize": this.#calculateFontSize(danmaku.size) + 'px',
            "--color": '#' + parseInt(danmaku.color).toString(16).padStart(6, '0'),

            "--offset": '',
            "--translateX": '',
            "--duration": '',
            "--offsetY": '',
        };


        const width = this.#widthMap.get(danmaku.size)! * danmaku.text.length;
        // console.log(this.#widthMap.get(danmaku.size),danmaku.text.length,width)
        if (danmaku.mode === '4') {
            const duration = 5;
            const offset = 0;
            const translateX = '0';

            option['--offset'] = offset + 'px';
            option['--translateX'] = translateX;
            option['--duration'] = duration + 's';
            option['--offsetY'] = this.#schedulers[1].getAvailableTrack(danmaku, duration * this.#videoSpeed) + 'px';
        } else if (danmaku.mode === '5') {
            const duration = 5;
            const offset = 0;
            const translateX = '0';

            option['--offset'] = offset + 'px';
            option['--translateX'] = translateX;
            option['--duration'] = duration + 's';
            option['--offsetY'] = this.#schedulers[2].getAvailableTrack(danmaku, duration * this.#videoSpeed) + 'px';
        } else {
            // 不支持的弹幕类型均视为普通弹幕
            const duration = (this.#containerWidth + width) / this.#calculateVelocity(width);
            const offset = 0;
            const translateX = 'calc(' + this.#containerWidth + 'px)';
            const compare = (a: Interval, danmaku: DanmakuType) => {
                return this.#heightMap.get(danmaku.size)! <= a.height && (danmaku.begin - a.end + this.#containerWidth / this.#calculateVelocity(a.width) <= 0
                    && (a.end - danmaku.begin) * this.#calculateVelocity(width) <= this.#containerWidth);
            };

            option['--offset'] = offset + 'px';
            option['--translateX'] = translateX;
            option['--duration'] = duration + 's';
            option['--offsetY'] = this.#schedulers[0].getAvailableTrack(danmaku, duration * this.#videoSpeed, compare.bind(this)) + 'px';
        }

        return option;
    }

    public addDanmaku(danmaku: DanmakuType) {
        this.#createDanmakuElement(danmaku, this.#createDanmakuOption(danmaku));

        // 优化弹幕添加性能，但会导致弹幕顺序错乱
        // const _addDanmaku = (depth: number = 0) => {
        //     requestIdleCallback((deadline) => {
        //         if (deadline.timeRemaining() < 0 && depth < 10) _addDanmaku(depth + 1);
        //         else this.#createDanmakuElement(danmaku, this.#createDanmakuOption(danmaku));
        //     });
        // }
        // _addDanmaku(0);
    }

}
