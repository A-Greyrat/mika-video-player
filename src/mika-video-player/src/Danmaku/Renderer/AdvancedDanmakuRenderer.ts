import { DanmakuAttr, DanmakuExtraData, IDanmakuRenderer } from './index.ts';

export class AdvancedDanmakuRenderer implements IDanmakuRenderer {
  render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData) {
    const { containerWidth, containerHeight, delay, timer, hideDanmaku } = extraData;

    if (danmaku.text.includes('NaN')) {
      console.warn('Invalid advanced danmaku', danmaku);
      timer.setTimeout(() => hideDanmaku(e), 0);
      return;
    }

    try {
      const params = JSON.parse(danmaku.text);
      let startX = parseFloat(params[0]);
      let startY = parseFloat(params[1]);
      let endX = parseFloat(params[7]);
      let endY = parseFloat(params[8]);
      const lifeTime = parseFloat(params[3]) * 1000;
      const content = params[4];
      const opacityStart = parseFloat(params[2].split('-')[0]);
      const opacityEnd = parseFloat(params[2].split('-')[1]);
      let animationDuration = parseInt(params[9] ? params[9] : '0', 10);
      let animationDelayTime = parseInt(params[10] ? params[10] : '0', 10);
      const isStroke = params[13];
      const isLinear = params[11];
      const fontFamily = params[12];

      timer.setTimeout(() => hideDanmaku(e), lifeTime - delay * 1000);

      if (lifeTime <= delay) {
        return;
      }

      const isNaN = (value: number) => Number.isNaN(value);

      if (
        isNaN(opacityStart) ||
        isNaN(startX) ||
        isNaN(startY) ||
        isNaN(endX) ||
        isNaN(endY) ||
        isNaN(opacityEnd) ||
        isNaN(lifeTime) ||
        lifeTime <= 0 ||
        isNaN(animationDuration) ||
        isNaN(animationDelayTime)
      ) {
        console.warn('Invalid advanced danmaku', danmaku, params);
        return;
      }

      // 如果startX、startY、endX、endY为0-1之间的小数，则转换为百分比
      if (startX <= 1) startX *= containerWidth;
      if (startY <= 1) startY *= containerHeight;
      if (endX <= 1) endX *= containerWidth;
      if (endY <= 1) endY *= containerHeight;

      const sinZ = Math.sin((-params[5] * Math.PI) / 180);
      const cosZ = Math.cos((-params[5] * Math.PI) / 180);
      const sinY = Math.sin((params[6] * Math.PI) / 180);
      const cosY = Math.cos((params[6] * Math.PI) / 180);

      if (isNaN(sinZ) || isNaN(cosZ) || isNaN(sinY) || isNaN(cosY)) {
        console.warn('Invalid advanced danmaku', danmaku, params);
        return;
      }

      const matrixStart = [
        [cosY * cosZ, -cosY * sinZ, sinY, 0],
        [sinZ, cosZ, 0, 0],
        [-sinY * cosZ, sinY * sinZ, cosY, 0],
        [startX, startY, 0, 1],
      ].join(',');

      const matrixEnd = [
        [cosY * cosZ, -cosY * sinZ, sinY, 0],
        [sinZ, cosZ, 0, 0],
        [-sinY * cosZ, sinY * sinZ, cosY, 0],
        [endX, endY, 0, 1],
      ].join(',');

      e.ariaLive = 'polite';
      e.classList.add('mika-video-player-danmaku');
      e.style.opacity = opacityStart.toString();
      e.textContent = content;
      e.style.color = danmaku.color;
      e.style.fontFamily = fontFamily;
      e.style.fontWeight = '800';
      e.style.fontSize = `${danmaku.size}px`;
      e.style.zIndex = '100';
      e.style.whiteSpace = 'pre';
      e.style.transformOrigin = '0 0 0';
      e.style.transform = `matrix3d(${matrixStart})`;
      e.style.textShadow = isStroke ? '1px 0 1px black, 0 1px 1px black, -1px 0 1px black, 0 -1px 1px black' : 'none';

      danmaku.style && Object.assign(e.style, danmaku.style);
      danmaku.render && danmaku.render(e);

      // 动画为 0 - var(--lifeTime) 的OpacityStart -> opacityEnd 的变化
      // var(--transformDelay) - var(--transformDelay) + var(--transformDuration) 的transform动画
      // 所以分为三个部分
      // 1. 0 - var(--transformDelay) 的透明度变化
      // 2. var(--transformDelay) - var(--transformDelay) + var(--transformDuration) 的transform、opacity动画
      // 3. var(--transformDelay) + var(--transformDuration) - var(--lifeTime) 的透明度变化

      if (animationDelayTime > lifeTime) {
        animationDelayTime = lifeTime;
      }

      if (animationDelayTime + animationDuration > lifeTime) {
        animationDuration = lifeTime - animationDelayTime;
      }

      e.animate(
        [
          {
            opacity: opacityStart,
            transform: `matrix3d(${matrixStart})`,
            offset: 0,
          },
          {
            opacity: opacityStart + ((opacityEnd - opacityStart) * animationDelayTime) / lifeTime,
            transform: `matrix3d(${matrixStart})`,
            offset: animationDelayTime / lifeTime,
          },
          {
            opacity: opacityStart + ((opacityEnd - opacityStart) * (animationDelayTime + animationDuration)) / lifeTime,
            transform: `matrix3d(${matrixEnd})`,
            offset: (animationDelayTime + animationDuration) / lifeTime,
          },
          {
            opacity: opacityEnd,
            transform: `matrix3d(${matrixEnd})`,
            offset: 1,
          },
        ],
        {
          duration: lifeTime,
          easing: isLinear ? 'linear' : 'ease',
          fill: 'forwards',
          delay: delay * 1000,
        },
      );
    } catch (_) {
      console.warn('Invalid advanced danmaku', danmaku);
      timer.setTimeout(() => hideDanmaku(e), 0);
    }
  }
}
