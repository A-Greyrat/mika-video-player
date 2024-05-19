import { DanmakuAttr, DanmakuExtraData, IDanmakuRenderer } from './index.ts';

const defaultFixedDanmakuLifeTime = 5;

export class BottomDanmakuRenderer implements IDanmakuRenderer {
  render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData) {
    const { danmakuWidth, danmakuHeight, alloc, danmakuOption, fontSize, delay, timer, hideDanmaku } = extraData;
    timer.setTimeout(() => hideDanmaku(e), (defaultFixedDanmakuLifeTime - delay) * 1000);

    if (defaultFixedDanmakuLifeTime <= delay) {
      return;
    }

    const offsetY = alloc.tryAllocTrack(danmaku, defaultFixedDanmakuLifeTime - delay, danmakuWidth, danmakuHeight);
    if (offsetY === -1) {
      return;
    }

    e.ariaLive = 'polite';
    e.classList.add('mika-video-player-danmaku');
    e.style.zIndex = '3';
    e.style.fontSize = `${fontSize}px`;
    e.style.color = danmaku.color;
    e.style.left = '50%';
    e.style.transform = 'translateX(-50%)';
    e.style.opacity = danmakuOption.opacity;
    e.style.textShadow = danmakuOption.textShadow;
    e.style.fontFamily = danmakuOption.fontFamily;
    e.style.fontWeight = danmakuOption.fontWeight;
    e.style.bottom = `${offsetY}px`;
    e.textContent = danmaku.text;

    danmaku.style && Object.assign(e.style, danmaku.style);
    danmaku.render && danmaku.render(e);
  }
}
