import React, { forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef } from 'react';
import defaultLoader from './Loader/DefaultLoader.ts';
import { Controller } from './Controller';

import './VideoPlayer.less';
import Danmaku from './Danmaku/Danmaku.tsx';
import { VideoPlayerContext, VideoPlayerProps } from './VideoPlayerType.ts';
import { defaultShortcuts, useShortcut } from './Controller/Shortcut/Shortcut.ts';

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
      danmaku = [],
      enableDanmaku = true,
      ...rest
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => videoRef.current!);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, forceUpdate] = React.useState(0);

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
      forceUpdate((prev) => prev + 1);
    }, []);

    return (
      <VideoPlayerContext.Provider
        value={{ props, videoElement: videoRef.current, containerElement: containerRef.current }}
      >
        <div
          className='mika-video-player-wrapper'
          {...handleShortcut}
          tabIndex={0}
          style={{ width: width ?? 'auto', height: height ?? 'auto', ...style }}
          ref={containerRef}
        >
          <video ref={videoRef} {...rest}>
            {children}
          </video>
          {enableDanmaku && <Danmaku />}
          {controls && <Controller ref={controllerRef} />}
        </div>
      </VideoPlayerContext.Provider>
    );
  }),
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
