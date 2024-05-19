import { Interval } from '../DanmakuAlloc.ts';
import { DanmakuAttr, DanmakuExtraData, IDanmakuRenderer } from './index.ts';

export class ReverseDanmakuRenderer implements IDanmakuRenderer {
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
      hideDanmaku,
    } = extraData;

    const duration = (containerWidth + danmakuWidth) / this.getVelocity(danmakuWidth, danmakuSpeed);
    const translateX = `${containerWidth}px`;

    if (duration <= delay) {
      return;
    }

    timer.setTimeout(() => hideDanmaku(e), (duration - delay) * 1000);

    const comparer = (i: Interval, danmaku: DanmakuAttr) => {
      const delta = i.start + i.duration - danmaku.begin;
      const delayDistance = this.getVelocity(danmakuWidth) * delay;
      return (
        delta * this.getVelocity(i.width) + delayDistance <= containerWidth && // 前弹幕以及完全进入屏幕
        delta * this.getVelocity(danmakuWidth) + delayDistance <= containerWidth
      ); // 在当前弹幕消失前，新弹幕不会追上前弹幕
    };

    const offsetY = alloc.tryAllocTrack(danmaku, duration - delay, danmakuWidth, danmakuHeight, comparer);

    if (offsetY === -1) {
      return;
    }

    e.ariaLive = 'polite';
    e.classList.add('mika-video-player-danmaku');
    e.style.zIndex = '1';
    e.style.fontSize = `${fontSize}px`;
    e.style.color = danmaku.color;
    e.textContent = danmaku.text;
    e.style.opacity = danmakuOption.opacity;
    e.style.textShadow = danmakuOption.textShadow;
    e.style.fontFamily = danmakuOption.fontFamily;
    e.style.fontWeight = danmakuOption.fontWeight;
    e.style.top = `${offsetY}px`;

    danmaku.style && Object.assign(e.style, danmaku.style);
    danmaku.render && danmaku.render(e);

    e.animate(
      [{ transform: `translate3d(-${danmakuWidth}px, 0, 0)` }, { transform: `translate3d(${translateX}, 0, 0)` }],
      {
        duration: duration * 1000,
        delay: -delay * 1000,
        fill: 'forwards',
      },
    );
  }
}
