export interface DanmakuType {
    begin: string;  // '弹幕出现的时间'
    mode: string;   // '1: 普通弹幕 4: 底部弹幕 5: 顶部弹幕 6: 逆向弹幕 7: 精准定位 8: 高级弹幕'
    size: string;   // '12: 非常小 16: 特小 18: 小 25: 中 36: 大 45: 很大 64: 特别大'
    color: string;  // '弹幕颜色'
    time: string;   // '用户发送弹幕的时间'
    pool: string;   // '0: 普通池 1: 字幕池 2: 特殊池'
    text: string;   // '弹幕内容'
}

export const DanmakuLifeTime = 5000;  // '弹幕的生命周期'

export const getDanmakuTracks = (danmaku: DanmakuType[], screenHeight: number, trackHeight: number) => {
    const trackCount = Math.floor(screenHeight / trackHeight);
    const tracks: DanmakuType[][] = new Array(trackCount).fill([]);
    danmaku.sort((a, b) => parseInt(a.time) - parseInt(b.time));

    for (const d of danmaku) {
        const time = parseInt(d.time);
        const track = tracks.find(t => t.every(d => parseInt(d.time) + DanmakuLifeTime < time) || t.length === 0);
        if (track) {
            track.push(d);
        }
    }

    return tracks;
}


export interface DanmakuOption {
    '--opacity': number;
    '--fontSize': number;
    '--fontFamily': string;
    '--fontWeight': string;
    '--textShadow': string;
    '--color': string;
    '--offset': number;
    '--translateX': number;
    '--duration': number;
    '--top': number;
}

export interface IDanmakuPool {
    destroy(): void;

    addDanmaku(danmaku: DanmakuType, option: DanmakuOption): void;
}

export class DanmakuPool implements IDanmakuPool{
    #container: HTMLDivElement;
    #availableDanmaku: HTMLDivElement[] = [];
    #currentDanmaku: HTMLDivElement[] = [];

    constructor(container: HTMLDivElement) {
        this.#container = container;
    }

    public destroy() {
        this.#availableDanmaku.forEach(d => d.remove);
        this.#currentDanmaku.forEach(d => d.remove);

        this.#availableDanmaku = [];
        this.#currentDanmaku = [];
    }

    public addDanmaku(danmaku: DanmakuType, option: DanmakuOption) {
        const d = document.createElement('div');
        d.className = 'mika-video-player-danmaku';

        Object.entries(option).forEach(([key, value]) => {
            d.style.setProperty(key, value.toString());
        });

        d.innerText = danmaku.text;
        this.#container.appendChild(d);
    }

}
