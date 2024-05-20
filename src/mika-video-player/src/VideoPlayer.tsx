import { forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef } from 'react';
import defaultLoader from './Loader/DefaultLoader.ts';
import { Controller } from './Controller';
import { useStore } from 'mika-store';
import Danmaku from './Danmaku/Danmaku.tsx';
import { VideoPlayerProps } from './VideoPlayerType.ts';
import { defaultShortcuts, useShortcut } from './Controller/Shortcut/Shortcut.ts';

import './VideoPlayer.less';

const VideoPlayer = memo(
  forwardRef((props: VideoPlayerProps, ref: Ref<HTMLVideoElement>) => {
    const {
      loader,
      controls,
      src,
      width,
      height,
      style,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toolbar,
      shortcut = defaultShortcuts,
      children,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      danmaku,
      enableDanmaku = true,
      extra,
      ...rest
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => videoRef.current!);
    const [extraData, setExtraData] = useStore<any>('mika-video-extra-data', {});

    const handleShortcut = useShortcut(shortcut, videoRef.current, containerRef.current, controllerRef.current);
    useEffect(() => {
      let url;
      if (typeof src === 'string') {
        url = src;
      } else if (src) {
        url = src.srcs[src.default ?? 0]?.url;
        if (typeof url === 'function') {
          url = url();
        }
      }

      if (url === undefined) {
        return;
      }

      if (typeof url === 'string') {
        if (loader && videoRef.current) {
          loader(videoRef.current);
        } else if (src) {
          defaultLoader(videoRef.current!, url);
        }
      }
    }, [loader, src, videoRef]);

    useEffect(() => {
      setExtraData({
        danmaku,
        controls,
        enableDanmaku,
        toolbar,
        children,
        extra,
        src,
        controllerElement: controllerRef.current,
        containerElement: containerRef.current,
        videoElement: videoRef.current,
      });
    }, [danmaku, controls, enableDanmaku, toolbar, children, extra, src, controllerRef, containerRef, videoRef]);

    return (
      <div
        style={{ width: width || 'fit-content', height: height || 'fit-content', ...style }}
        ref={containerRef}
      >
        {/* 该Div用于处理快捷键 */}
        <div
          className='mika-video-player-wrapper'
          {...handleShortcut}
        >
          <video ref={videoRef} {...rest}>
            {children}
          </video>
          {(extraData?.enableDanmaku ?? enableDanmaku) && <Danmaku />}
          {(extraData?.controls ?? controls) && <Controller ref={controllerRef} />}
        </div>
      </div>
    );
  }),
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
