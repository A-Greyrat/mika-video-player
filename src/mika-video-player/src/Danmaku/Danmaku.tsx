import { forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef } from 'react';
import { DanmakuScheduler } from './Scheduler/DanmakuScheduler.ts';

import './Danmaku.less';
import { useStore } from 'mika-store';

const Danmaku = memo(
  forwardRef((_props: NonNullable<unknown>, ref: Ref<HTMLDivElement>) => {
    const [{ videoElement, danmaku }] = useStore<any>('mika-video-extra-data');

    const containerRef = useRef<HTMLDivElement>(null);
    const danmakuScheduler = useRef<DanmakuScheduler | null>(null);
    useImperativeHandle(ref, () => containerRef.current!);

    useEffect(() => {
      if (!videoElement || !danmaku || !danmaku.length || !containerRef.current) return;
      danmakuScheduler.current = new DanmakuScheduler(videoElement, containerRef.current, danmaku);

      return () => {
        danmakuScheduler.current?.destroy();
      };
    }, [danmaku, videoElement]);

    return <div className='mika-video-player-danmaku-container' ref={containerRef} />;
  }),
);

Danmaku.displayName = 'Danmaku';
export default Danmaku;
