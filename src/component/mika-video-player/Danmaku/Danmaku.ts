import {DanmakuParam} from "./DanmakuPool.ts";
import {DanmakuScheduler, Interval} from "./DanmakuScheduler.ts";

export interface DanmakuAttr {
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

export interface IDanmakuType {
    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam;

    getDanmakuCSSClass(): string;

    set containerWidth(value: number);

    set scheduler(value: DanmakuScheduler);
}

class NormalDanmaku implements IDanmakuType {
    #scheduler?: DanmakuScheduler;
    #containerWidth?: number;
    #danmakuSpeed = 1;

    #getVelocity(width: number): number {
        return (40 * Math.log10(width) + 100) * this.#danmakuSpeed;
    }

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        if (!this.#containerWidth || !this.#scheduler) {
            throw new Error('containerWidth or scheduler is not set');
        }

        const duration = (this.#containerWidth + width) / this.#getVelocity(width);
        const translateX = 'calc(' + this.#containerWidth + 'px)';

        const comparer = (a: Interval, danmaku: DanmakuAttr) => {
            const delta = a.start + a.duration - danmaku.begin;
            const delayDistance = this.#getVelocity(width) * delay;
            return delta * this.#getVelocity(a.width) + delayDistance <= this.#containerWidth! && // 前弹幕以及完全进入屏幕
                delta * this.#getVelocity(width) + delayDistance <= this.#containerWidth!; // 在当前弹幕消失前，新弹幕不会追上前弹幕
        };

        const offsetY = this.#scheduler.getAvailableTrack(danmaku, duration - delay, width, height, comparer);

        return {
            '--duration': duration + 's',
            '--translateX': translateX,
            '--offsetY': offsetY + 'px',
            '--delay': -delay + 's',
        };
    }

    getDanmakuCSSClass(): string {
        return 'mika-video-player-danmaku';
    }

    set containerWidth(value: number) {
        this.#containerWidth = value;
    }

    set scheduler(value: DanmakuScheduler) {
        this.#scheduler = value;
    }
}

class TopDanmaku implements IDanmakuType {
    #scheduler?: DanmakuScheduler;
    #containerWidth?: number;

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        if (!this.#containerWidth || !this.#scheduler) {
            throw new Error('containerWidth or scheduler is not set');
        }

        const duration = 5;
        let offsetY = -1;
        if (delay < duration) {
            offsetY = this.#scheduler.getAvailableTrack(danmaku, duration, width, height);
        }

        return {
            '--duration': duration + 's',
            '--translateX': '0',
            '--offsetY': offsetY + 'px',
            '--delay': -delay + 's',
        };
    }

    getDanmakuCSSClass(): string {
        return 'mika-video-player-danmaku-top';
    }

    set containerWidth(value: number) {
        this.#containerWidth = value;
    }

    set scheduler(value: DanmakuScheduler) {
        this.#scheduler = value;
    }
}

class BottomDanmaku implements IDanmakuType {
    #scheduler?: DanmakuScheduler;
    #containerWidth?: number;

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        if (!this.#containerWidth || !this.#scheduler) {
            throw new Error('containerWidth or scheduler is not set');
        }

        const duration = 5;

        // Return -1 means that the danmaku is not available
        let offsetY = -1;
        if (delay < duration) {
            offsetY = this.#scheduler.getAvailableTrack(danmaku, duration, width, height);
        }


        return {
            '--duration': duration + 's',
            '--translateX': '0',
            '--offsetY': offsetY + 'px',
            '--delay': -delay + 's',
        };
    }

    getDanmakuCSSClass(): string {
        return 'mika-video-player-danmaku-bottom';
    }

    set containerWidth(value: number) {
        this.#containerWidth = value;
    }

    set scheduler(value: DanmakuScheduler) {
        this.#scheduler = value;
    }
}

export default new Map<number, IDanmakuType>([
    [1, new NormalDanmaku()],
    [5, new TopDanmaku()],
    [4, new BottomDanmaku()],
]);
