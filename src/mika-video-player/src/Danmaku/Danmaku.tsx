import { forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef } from 'react';
import { DanmakuScheduler } from './Scheduler/DanmakuScheduler.ts';

import './Danmaku.less';
import { useStore } from 'mika-store';
import { VideoPlayerExtraData } from '../VideoPlayerType.ts';

const Danmaku = memo(
  forwardRef((_props: NonNullable<unknown>, ref: Ref<HTMLDivElement>) => {
    const [{ videoElement, danmaku, enableDanmaku }, setExtra] =
      useStore<VideoPlayerExtraData>('mika-video-extra-data');

    const containerRef = useRef<HTMLDivElement>(null);
    const danmakuScheduler = useRef<DanmakuScheduler | null>(null);
    useImperativeHandle(ref, () => containerRef.current!);

    useEffect(() => {
      if (!videoElement || !containerRef.current) return;
      danmakuScheduler.current = new DanmakuScheduler(videoElement, containerRef.current, []);

      setExtra((e) => {
        e.danmakuScheduler = danmakuScheduler.current || undefined;
        return { ...e };
      });
    }, [videoElement, containerRef.current]);

    useEffect(() => {
      if (!danmaku || !danmaku.length) return;

      danmakuScheduler.current?.clearDanmaku();
      danmakuScheduler.current?.addDanmaku(danmaku);
    }, [danmaku]);

    return (
      <div
        className='mika-video-player-danmaku-container'
        style={{
          display: enableDanmaku ? 'block' : 'none',
        }}
        ref={containerRef}
      />
    );
  }),
);

Danmaku.displayName = 'Danmaku';
export default Danmaku;
