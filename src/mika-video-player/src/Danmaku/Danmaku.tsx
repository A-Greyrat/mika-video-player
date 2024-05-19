import { forwardRef, memo, Ref, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { VideoPlayerContext } from '../VideoPlayerType';
import { DanmakuScheduler } from './Scheduler/DanmakuScheduler.ts';

import './Danmaku.less';

const Danmaku = memo(
  forwardRef((_props: NonNullable<unknown>, ref: Ref<HTMLDivElement>) => {
    const context = useContext(VideoPlayerContext);
    const videoElement = context?.videoElement;
    const danmaku = context?.props.danmaku;
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
