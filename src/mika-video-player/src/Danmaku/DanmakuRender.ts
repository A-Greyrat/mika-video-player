import {DanmakuAlloc, Interval} from "./DanmakuAlloc.ts";
import {DanmakuOption, Timer} from "./DanmakuManager.ts";

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
    style?: Partial<CSSStyleDeclaration>;
    render?: (element: HTMLElement) => void;
}

export interface DanmakuExtraData {
    containerWidth: number;
    containerHeight: number;
    danmakuWidth: number;
    danmakuHeight: number;
    danmakuSpeed: number;
    alloc: DanmakuAlloc;
    delay: number;
    fontSize: number;
    danmakuOption: DanmakuOption;
    timer: Timer;
    hideDanmaku: (e: HTMLDivElement) => void;
}

export interface IDanmakuRender {
    render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData): void;
}

export class NormalDanmakuRender implements IDanmakuRender {
    private getVelocity(width: number, speed = 1): number {
        return (40 * Math.log10(width) + 100) * speed;
    }

    render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData): void {
        const {
            containerWidth,
            danmakuWidth,
            danmakuHeight,
            alloc,
            fontSize,
            delay,
            timer,
            danmakuOption,
            danmakuSpeed,
            hideDanmaku
        } = extraData;

        e.ariaLive = 'polite';
        e.classList.add('mika-video-player-danmaku');
        e.style.opacity = '0';
        e.style.zIndex = '1';
        e.style.fontSize = fontSize + 'px';
        e.style.color = danmaku.color;
        e.textContent = danmaku.text;
        e.style.textShadow = danmakuOption['textShadow'];
        e.style.fontFamily = danmakuOption['fontFamily'];
        e.style.fontWeight = danmakuOption['fontWeight'];

        const duration = (containerWidth + danmakuWidth) / this.getVelocity(danmakuWidth, danmakuSpeed);
        const translateX = containerWidth + 'px';

        const comparer = (i: Interval, danmaku: DanmakuAttr) => {
            const delta = i.start + i.duration - danmaku.begin;
            const delayDistance = this.getVelocity(danmakuWidth) * delay;
            return delta * this.getVelocity(i.width) + delayDistance <= containerWidth && // 前弹幕以及完全进入屏幕
                delta * this.getVelocity(danmakuWidth) + delayDistance <= containerWidth; // 在当前弹幕消失前，新弹幕不会追上前弹幕
        };

        const offsetY = alloc.tryAllocTrack(danmaku, duration - delay, danmakuWidth, danmakuHeight, comparer);
        e.style.top = offsetY + 'px';

        timer.setTimeout(() => hideDanmaku(e), (duration - delay) * 1000);

        if (offsetY === -1) {
            e.style.display = 'none';
            return;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                e.style.opacity = danmakuOption['opacity'];
                danmaku.style && Object.assign(e.style, danmaku.style);
                danmaku.render && danmaku.render(e);

                e.animate([
                    {transform: `translate3d(${translateX}, 0, 0)`},
                    {transform: `translate3d(-${danmakuWidth}px, 0, 0)`}
                ], {
                    duration: duration * 1000,
                    delay: -delay * 1000,
                    fill: 'forwards'
                });
            });
        });
    }
}

const defaultFixedDanmakuLifeTime = 5;

export class BottomDanmakuRender implements IDanmakuRender {

    render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData) {
        const {
            danmakuWidth,
            danmakuHeight,
            alloc,
            danmakuOption,
            fontSize,
            delay,
            timer,
            hideDanmaku
        } = extraData;

        e.ariaLive = 'polite';
        e.classList.add('mika-video-player-danmaku');
        e.style.opacity = '0';
        e.style.zIndex = '3';
        e.textContent = danmaku.text;
        e.style.fontSize = fontSize + 'px';
        e.style.color = danmaku.color;
        e.style.left = '50%';
        e.style.transform = 'translateX(-50%)';
        e.style.textShadow = danmakuOption['textShadow'];
        e.style.fontFamily = danmakuOption['fontFamily'];
        e.style.fontWeight = danmakuOption['fontWeight'];

        const offsetY = alloc.tryAllocTrack(danmaku, defaultFixedDanmakuLifeTime - delay, danmakuWidth, danmakuHeight);
        e.style.bottom = offsetY + 'px';
        timer.setTimeout(() => hideDanmaku(e), (defaultFixedDanmakuLifeTime - delay) * 1000);

        if (offsetY === -1) {
            e.style.display = 'none';
            return;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                e.style.opacity = danmakuOption['opacity'];
                danmaku.style && Object.assign(e.style, danmaku.style);
                danmaku.render && danmaku.render(e);
            });
        });
    }
}

export class TopDanmakuRender implements IDanmakuRender {

    render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData) {
        const {
            danmakuWidth,
            danmakuHeight,
            alloc,
            fontSize,
            danmakuOption,
            delay,
            timer,
            hideDanmaku
        } = extraData;

        e.ariaLive = 'polite';
        e.classList.add('mika-video-player-danmaku');
        e.style.opacity = '0';
        e.style.zIndex = '2';
        e.textContent = danmaku.text;
        e.style.fontSize = fontSize + 'px';
        e.style.color = danmaku.color;
        e.style.left = '50%';
        e.style.transform = 'translateX(-50%)';
        e.style.textShadow = danmakuOption['textShadow'];
        e.style.fontFamily = danmakuOption['fontFamily'];
        e.style.fontWeight = danmakuOption['fontWeight'];

        const offsetY = alloc.tryAllocTrack(danmaku, defaultFixedDanmakuLifeTime - delay, danmakuWidth, danmakuHeight);
        e.style.top = offsetY + 'px';

        timer.setTimeout(() => hideDanmaku(e), (defaultFixedDanmakuLifeTime - delay) * 1000);

        if (offsetY === -1) {
            e.style.display = 'none';
            return;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                e.style.opacity = danmakuOption['opacity'];
                danmaku.style && Object.assign(e.style, danmaku.style);
                danmaku.render && danmaku.render(e);
            });
        });
    }
}

export class AdvancedDanmakuRender implements IDanmakuRender {

    render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData) {
        const {
            containerWidth,
            containerHeight,
            delay,
            timer,
            hideDanmaku
        } = extraData;

        if (danmaku.text.includes('NaN')) {
            console.warn('Invalid advanced danmaku', danmaku);
            return;
        }

        try {
            const params = JSON.parse(danmaku.text);
            let startX = parseFloat(params[0]);
            let startY = parseFloat(params[1]);
            let endX = parseFloat(params[7]);
            let endY = parseFloat(params[8]);
            const lifeTime = parseFloat(params[3]) * 1000;
            const opacityStart = parseFloat(params[2].split('-')[0]);
            const opacityEnd = parseFloat(params[2].split('-')[1]);
            let animationDuration = parseInt(params[9] ? params[9] : '0');
            let animationDelayTime = parseInt(params[10] ? params[10] : '0');
            const isStroke = params[13];
            const isLinear = params[11];
            const fontFamily = params[12];

            if (isNaN(opacityStart)
                || isNaN(startX)
                || isNaN(startY)
                || isNaN(endX)
                || isNaN(endY)
                || isNaN(opacityEnd)
                || isNaN(lifeTime)
                || lifeTime <= 0
                || isNaN(animationDuration)
                || isNaN(animationDelayTime)) {
                console.warn('Invalid advanced danmaku', danmaku, params);
                return;
            }

            // 如果startX、startY、endX、endY为0-1之间的小数，则转换为百分比
            if (startX < 1) startX *= containerWidth;
            if (startY < 1) startY *= containerHeight;
            if (endX < 1) endX *= containerWidth;
            if (endY < 1) endY *= containerHeight;

            const sinZ = Math.sin(-params[5] * Math.PI / 180);
            const cosZ = Math.cos(-params[5] * Math.PI / 180);
            const sinY = Math.sin(params[6] * Math.PI / 180);
            const cosY = Math.cos(params[6] * Math.PI / 180);

            if (isNaN(sinZ) || isNaN(cosZ) || isNaN(sinY) || isNaN(cosY)) {
                console.warn('Invalid advanced danmaku', danmaku, params);
                return;
            }

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

            e.ariaLive = 'polite';
            e.classList.add('mika-video-player-danmaku');
            e.style.opacity = '0';
            e.textContent = params[4];
            e.style.color = danmaku.color;
            e.style.fontFamily = fontFamily;
            e.style.fontSize = danmaku.size + 'px';
            e.style.zIndex = '10';
            e.style.transformOrigin = '0 0 0';
            e.style.transform = `matrix3d(${matrixStart})`;
            e.style.textShadow = isStroke ? '1px 0 1px black, 0 1px 1px black, -1px 0 1px black, 0 -1px 1px black' : 'none';

            // 动画为 0 - var(--lifeTime) 的OpacityStart -> opacityEnd 的变化
            // var(--transformDelay) - var(--transformDelay) + var(--transformDuration) 的transform动画
            // 所以分为三个部分
            // 1. 0 - var(--transformDelay) 的透明度变化
            // 2. var(--transformDelay) - var(--transformDelay) + var(--transformDuration) 的transform、opacity动画
            // 3. var(--transformDelay) + var(--transformDuration) - var(--lifeTime) 的透明度变化

            if (animationDelayTime > lifeTime) {
                animationDelayTime = lifeTime;
            }

            if ((animationDelayTime + animationDuration) > lifeTime) {
                animationDuration = lifeTime - animationDelayTime;
            }

            timer.setTimeout(() => hideDanmaku(e), lifeTime - delay * 1000);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    e.style.opacity = opacityStart.toString();

                    e.animate([
                        {
                            opacity: opacityStart,
                            transform: `matrix3d(${matrixStart})`,
                            offset: 0
                        },
                        {
                            opacity: opacityStart + (opacityEnd - opacityStart) * animationDelayTime / lifeTime,
                            transform: `matrix3d(${matrixStart})`,
                            offset: animationDelayTime / lifeTime
                        },
                        {
                            opacity: opacityStart + (opacityEnd - opacityStart) * (animationDelayTime + animationDuration) / lifeTime,
                            transform: `matrix3d(${matrixEnd})`,
                            offset: (animationDelayTime + animationDuration) / lifeTime
                        },
                        {
                            opacity: opacityEnd,
                            transform: `matrix3d(${matrixEnd})`,
                            offset: 1
                        }
                    ], {
                        duration: lifeTime,
                        easing: isLinear ? 'linear' : 'ease',
                        fill: 'forwards',
                        delay: delay * 1000
                    });

                    danmaku.style && Object.assign(e.style, danmaku.style);
                    danmaku.render && danmaku.render(e);
                });
            });
        } catch (e) {
            console.warn('Invalid advanced danmaku', danmaku);
            return;
        }
    }
}

export class ReverseDanmakuRender implements IDanmakuRender {

    private getVelocity(width: number, speed = 1): number {
        return (40 * Math.log10(width) + 100) * speed;
    }

    render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData): void {
        const {
            containerWidth,
            danmakuWidth,
            danmakuHeight,
            alloc,
            fontSize,
            delay,
            timer,
            danmakuOption,
            danmakuSpeed,
            hideDanmaku
        } = extraData;

        e.ariaLive = 'polite';
        e.classList.add('mika-video-player-danmaku');
        e.style.opacity = '0';
        e.style.zIndex = '1';
        e.style.fontSize = fontSize + 'px';
        e.style.color = danmaku.color;
        e.textContent = danmaku.text;
        e.style.textShadow = danmakuOption['textShadow'];
        e.style.fontFamily = danmakuOption['fontFamily'];
        e.style.fontWeight = danmakuOption['fontWeight'];

        const duration = (containerWidth + danmakuWidth) / this.getVelocity(danmakuWidth, danmakuSpeed);
        const translateX = containerWidth + 'px';

        const comparer = (i: Interval, danmaku: DanmakuAttr) => {
            const delta = i.start + i.duration - danmaku.begin;
            const delayDistance = this.getVelocity(danmakuWidth) * delay;
            return delta * this.getVelocity(i.width) + delayDistance <= containerWidth && // 前弹幕以及完全进入屏幕
                delta * this.getVelocity(danmakuWidth) + delayDistance <= containerWidth; // 在当前弹幕消失前，新弹幕不会追上前弹幕
        };

        const offsetY = alloc.tryAllocTrack(danmaku, duration - delay, danmakuWidth, danmakuHeight, comparer);
        e.style.top = offsetY + 'px';

        timer.setTimeout(() => hideDanmaku(e), (duration - delay) * 1000);

        if (offsetY === -1) {
            e.style.display = 'none';
            return;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                e.style.opacity = danmakuOption['opacity'];
                danmaku.style && Object.assign(e.style, danmaku.style);
                danmaku.render && danmaku.render(e);

                e.animate([
                    {transform: `translate3d(-${danmakuWidth}px, 0, 0)`},
                    {transform: `translate3d(${translateX}, 0, 0)`}
                ], {
                    duration: duration * 1000,
                    delay: -delay * 1000,
                    fill: 'forwards'
                });
            });
        });
    }
}

export const danmakuRenderMap = new Map<number, IDanmakuRender>([
    [1, new NormalDanmakuRender()],
    [4, new BottomDanmakuRender()],
    [5, new TopDanmakuRender()],
    [6, new ReverseDanmakuRender()],
    [7, new AdvancedDanmakuRender()],
]);

export const getDanmakuRender = (type: number): IDanmakuRender => {
    return danmakuRenderMap.get(type) || danmakuRenderMap.get(1)!;
}
