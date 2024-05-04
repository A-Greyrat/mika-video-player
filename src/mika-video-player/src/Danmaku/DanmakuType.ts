import {DanmakuParam} from "./DanmakuPool.ts";
import {DanmakuAlloc, Interval} from "./DanmakuAlloc.ts";

export interface DanmakuAttr {
    // 弹幕出现的时间, 单位: 秒
    begin: number;
    // 1 2 3：普通弹幕
    // 4：底部弹幕
    // 5：顶部弹幕
    // 6：逆向弹幕
    // 7：高级弹幕
    // 8：代码弹幕
    // 9：BAS 弹幕（仅限于特殊弹幕专包）
    mode: number;
    // 18：小, 25：标准, 36：大
    size: number;
    // 弹幕颜色
    color: string;
    // 弹幕内容
    text: string;

    // extra
    // TODO: support custom danmaku
    style?: Partial<CSSStyleDeclaration>;
    render?: (element: HTMLElement) => void;
}

export interface IDanmakuType {
    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam;

    getDanmakuCSSClass(): string;

    set containerWidth(value: number);

    set alloc(value: DanmakuAlloc);
}

class NormalDanmaku implements IDanmakuType {
    private _alloc?: DanmakuAlloc;
    private _containerWidth?: number;
    private danmakuSpeed = 1;

    private getVelocity(width: number): number {
        return (40 * Math.log10(width) + 100) * this.danmakuSpeed;
    }

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        if (!this._containerWidth || !this._alloc) {
            throw new Error('containerWidth or alloc is not set');
        }

        const duration = (this._containerWidth + width) / this.getVelocity(width);
        const translateX = 'calc(' + this._containerWidth + 'px)';

        const comparer = (i: Interval, danmaku: DanmakuAttr) => {
            const delta = i.start + i.duration - danmaku.begin;
            const delayDistance = this.getVelocity(width) * delay;
            return delta * this.getVelocity(i.width) + delayDistance <= this._containerWidth! && // 前弹幕以及完全进入屏幕
                delta * this.getVelocity(width) + delayDistance <= this._containerWidth!; // 在当前弹幕消失前，新弹幕不会追上前弹幕
        };

        const offsetY = this._alloc.tryAllocTrack(danmaku, duration - delay, width, height, comparer);

        return {
            '--duration': duration + 's',
            '--translateX': translateX,
            '--offsetY': offsetY + 'px',
            '--delay': -delay + 's',
            '--width': -width + 'px',
        } as DanmakuParam;
    }

    getDanmakuCSSClass(): string {
        return 'mika-video-player-danmaku-normal';
    }

    set containerWidth(value: number) {
        this._containerWidth = value;
    }

    set alloc(value: DanmakuAlloc) {
        this._alloc = value;
    }
}

class TopDanmaku implements IDanmakuType {
    private _alloc?: DanmakuAlloc;

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        if (!this._alloc) {
            throw new Error('alloc is not set');
        }

        const duration = 5;
        let offsetY = -1;
        if (delay < duration) {
            offsetY = this._alloc.tryAllocTrack(danmaku, duration, width, height);
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

    set containerWidth(_value: number) {
    }

    set alloc(_value: DanmakuAlloc) {
        this._alloc = _value;
    }
}

class BottomDanmaku implements IDanmakuType {
    private _alloc?: DanmakuAlloc;

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        if (!this._alloc) {
            throw new Error('alloc is not set');
        }

        const duration = 5;

        // Return -1 means that the danmaku is not available
        let offsetY = -1;
        if (delay < duration) {
            offsetY = this.alloc.tryAllocTrack(danmaku, duration, width, height);
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

    set containerWidth(_value: number) {
    }

    set alloc(_value: DanmakuAlloc) {
        this._alloc = _value;
    }
}

class ReverseDanmaku implements IDanmakuType {
    private _alloc?: DanmakuAlloc;
    private _containerWidth?: number;
    danmakuSpeed = 1;

    private getVelocity(width: number): number {
        return (40 * Math.log10(width) + 100) * this.danmakuSpeed;
    }

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        if (!this._containerWidth || !this._alloc) {
            throw new Error('containerWidth or alloc is not set');
        }

        const duration = (this._containerWidth + width) / this.getVelocity(width);
        const translateX = 'calc(' + this._containerWidth + 'px)';

        const comparer = (i: Interval, danmaku: DanmakuAttr) => {
            const delta = i.start + i.duration - danmaku.begin;
            const delayDistance = this.getVelocity(width) * delay;
            return delta * this.getVelocity(i.width) + delayDistance <= this._containerWidth! && // 前弹幕以及完全进入屏幕
                delta * this.getVelocity(width) + delayDistance <= this._containerWidth!; // 在当前弹幕消失前，新弹幕不会追上前弹幕
        };

        const offsetY = this.alloc.tryAllocTrack(danmaku, duration - delay, width, height, comparer);

        return {
            '--duration': duration + 's',
            '--translateX': translateX,
            '--offsetY': offsetY + 'px',
            '--delay': -delay + 's',
        };
    }

    getDanmakuCSSClass(): string {
        return 'mika-video-player-danmaku-reverse';
    }

    set containerWidth(value: number) {
        this._containerWidth = value;
    }

    set alloc(value: DanmakuAlloc) {
        this._alloc = value;
    }
}

// 高级弹幕样例：[120,340,"1-0",3.85,"高级弹幕测试",30,20,560,780,1000,300,0,"NSimSun",1]
// 120, 340 - 弹幕起始坐标
// "1-0" - 衰弱透明度
// 3.85 - 生存时间
// "高级弹幕测试" - 弹幕内容
// 30 - Z轴翻转
// 20 - Y轴翻转
// 560, 780 - 弹幕结束坐标
// 1000 - 运动耗时
// 300 - 延迟时间
// 0 - 文字描边
// "NSimSun" - 字体
// 1 - 线性加速
class AdvancedDanmaku implements IDanmakuType {

    getDanmakuParam(danmaku: DanmakuAttr, width: number, height: number, delay: number): DanmakuParam {
        const params = JSON.parse(danmaku.text);
        let startX = params[0];
        let startY = params[1];
        let endX = params[7];
        let endY = params[8];
        const lifeTime = params[3];
        const opacityStart = parseFloat(params[2].split('-')[0]);
        const opacityEnd = parseFloat(params[2].split('-')[1]);
        const animationDuration = params[9];
        const animationDelayTime = params[10];
        const isStroke = params[13];
        const isLinear = params[11];
        const fontFamily = params[12];
        danmaku.text = params[4];

        // 如果startX、startY、endX、endY为0-1之间的小数，则转换为百分比
        if (startX < 1) startX *= width;
        if (startY < 1) startY *= height;
        if (endX < 1) endX *= width;
        if (endY < 1) endY *= height;

        const sinZ = Math.sin(-params[5] * Math.PI / 180);
        const cosZ = Math.cos(-params[5] * Math.PI / 180);
        const sinY = Math.sin(params[6] * Math.PI / 180);
        const cosY = Math.cos(params[6] * Math.PI / 180);

        const matrixStart = [
            [cosY * cosZ, -cosY * sinZ, sinY, 0],
            [sinZ, cosZ, 0, 0],
            [-sinY * cosZ, sinY * sinZ, cosY, 0],
            [startX, startY, 0, 1]
        ].join(',');

        const matrixEnd = [
            [cosY * cosZ, -cosY * sinZ, sinY, 0],
            [sinZ, cosZ, 0, 0],
            [-sinY * cosZ, sinY * sinZ, cosY, 0],
            [endX, endY, 0, 1]
        ].join(',');

        let opacityMiddle = opacityEnd;
        if (lifeTime > animationDuration / 1000) {
            opacityMiddle = opacityStart + (opacityEnd - opacityStart) * (animationDuration / 1000) / lifeTime;
        }

        return {
            '--duration': lifeTime + 's',
            '--translateX': '0',
            '--offsetY': '0',
            '--delay': -delay + 's',
            '--transformDelay': animationDelayTime / 1000 + 's',
            '--startX': startX + 'px',
            '--startY': startY + 'px',
            '--endX': endX + 'px',
            '--endY': endY + 'px',
            '--opacityStart': opacityStart,
            '--opacityMiddle': opacityMiddle,
            '--opacityEnd': opacityEnd,
            '--transformDuration': animationDuration + 'ms',
            '--strokeSize': isStroke ? '1px' : '0',
            '--fontFamily': fontFamily,
            '--advanceFontSize': danmaku.size + 'px',
            '--animationTimingFunction': isLinear ? 'linear' : 'ease',
            '--matrixStart': matrixStart,
            '--matrixEnd': matrixEnd,
        } as DanmakuParam;
    }

    getDanmakuCSSClass(): string {
        return 'mika-video-player-danmaku-advanced';
    }

    set containerWidth(_value: number) {

    }

    set alloc(_value: DanmakuAlloc) {

    }
}

export const DanmakuTypeMap = new Map<number, IDanmakuType>([
    [1, new NormalDanmaku()],
    [2, new NormalDanmaku()],
    [3, new NormalDanmaku()],
    [4, new BottomDanmaku()],
    [5, new TopDanmaku()],
    [6, new ReverseDanmaku()],
    [7, new AdvancedDanmaku()]
]);
