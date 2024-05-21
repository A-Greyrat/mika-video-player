import React, { forwardRef, Fragment, memo, Ref, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import defaultLoader from './Loader/DefaultLoader.ts';
import { Controller } from './Controller';
import { useStore } from 'mika-store';
import Danmaku from './Danmaku/Danmaku.tsx';
import { VideoPlayerExtraData, VideoPlayerProps } from './VideoPlayerType.ts';
import { defaultShortcuts, useShortcut } from './Controller/Shortcut/Shortcut.tsx';
import { DefaultToolbarArea } from './Controller/ToolBar/ToolBar.tsx';

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
      toolbar = DefaultToolbarArea,
      shortcut = defaultShortcuts,
      children,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      danmaku,
      autoPlayNext = 'none',
      autoPlayNextSrc,
      enableDanmaku = true,
      danmakuOptions,
      onSendDanmaku,
      onChangeDanmakuOptions,
      videoRatio,
      extra,
      plugins = [],
      ...rest
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<HTMLDivElement>(null);
    const canPluginRegistered = useRef(false);
    useImperativeHandle(ref, () => videoRef.current!);
    const [extraData, setExtraData] = useStore<VideoPlayerExtraData>('mika-video-extra-data', {
      danmaku,
      controls,
      enableDanmaku,
      toolbar,
      children,
      extra,
      shortcut,
      src,
      danmakuOptions,
      onSendDanmaku,
      onChangeDanmakuOptions,
      controllerElement: undefined,
      containerElement: undefined,
      videoElement: undefined,
      autoPlayNext,
      autoPlayNextSrc,
      videoRatio,
      overlay: new Map<string, React.ReactNode>(),
      danmakuScheduler: undefined,
    });

    const handleShortcut = useShortcut(
      extraData?.shortcut,
      videoRef.current,
      containerRef.current,
      controllerRef.current,
    );

    const loadVideo = useCallback(() => {
      const loaderFunc = loader || defaultLoader;
      src && loaderFunc(videoRef.current!, src);
    }, [loader, src, videoRef]);

    useEffect(() => {
      loadVideo();
    }, [loadVideo]);

    useEffect(() => {
      setExtraData((e) => {
        canPluginRegistered.current = true;
        return {
          ...e,
          danmaku,
          controls,
          enableDanmaku,
          danmakuOptions,
          onChangeDanmakuOptions,
          toolbar,
          children,
          shortcut,
          extra,
          src,
          autoPlayNext,
          autoPlayNextSrc,
          videoRatio,
          onSendDanmaku,
          controllerElement: controllerRef.current,
          containerElement: containerRef.current,
          videoElement: videoRef.current,
        };
      });
    }, [
      danmaku,
      controls,
      enableDanmaku,
      danmakuOptions,
      onChangeDanmakuOptions,
      onSendDanmaku,
      toolbar,
      shortcut,
      children,
      extra,
      src,
      controllerRef,
      containerRef,
      videoRef,
      autoPlayNext,
      autoPlayNextSrc,
      videoRatio,
    ]);

    useEffect(() => {
      if (!canPluginRegistered.current) return;

      canPluginRegistered.current = false;
      plugins.forEach((plugin) => {
        plugin.install && plugin.install.bind(plugin)(extraData, setExtraData);
      });
    }, [plugins, extraData]);

    useEffect(() => {
      if (!videoRef.current) return;

      const replay = () => {
        videoRef.current?.play().then(undefined);
      };

      const playNext = () => {
        if (autoPlayNextSrc) {
          setExtraData((e) => {
            e.src = autoPlayNextSrc;
            return e;
          });
          loadVideo();
        }
      };

      if (autoPlayNext === 'replay') {
        videoRef.current.addEventListener('ended', replay);
      } else if (autoPlayNext === 'next') {
        videoRef.current.addEventListener('ended', playNext);
      }

      return () => {
        if (autoPlayNext === 'replay') {
          videoRef.current?.removeEventListener('ended', replay);
        } else if (autoPlayNext === 'next') {
          videoRef.current?.removeEventListener('ended', playNext);
        }
      };
    }, [autoPlayNext, videoRef.current, loadVideo]);

    useEffect(() => {
      const videoRatioArr: any[] | undefined = (extraData?.videoRatio ?? videoRatio)?.split('/');
      if (videoRatioArr && videoRatioArr.length === 2) {
        videoRatioArr[0] = parseFloat(videoRatioArr[0]);
        videoRatioArr[1] = parseFloat(videoRatioArr[1]);
        const containerWidth = containerRef.current?.clientWidth;
        const containerHeight = containerRef.current?.clientHeight;

        if (containerWidth && containerHeight) {
          const height = (containerWidth / videoRatioArr[0]) * videoRatioArr[1];
          if (height <= containerHeight) {
            videoRef.current && (videoRef.current.style.width = '100%');
            videoRef.current && (videoRef.current.style.height = 'auto');
          } else {
            videoRef.current && (videoRef.current.style.height = '100%');
            videoRef.current && (videoRef.current.style.width = 'auto');
          }
        }
      }
    }, [videoRatio, extraData?.videoRatio]);

    return (
      <div
        style={{ width: width || 'fit-content', height: height || 'fit-content', position: 'relative', ...style }}
        ref={containerRef}
      >
        {/* 该Div用于处理快捷键 */}
        <div className='mika-video-player-wrapper' {...handleShortcut}>
          <video
            ref={videoRef}
            style={{
              objectFit: extraData?.videoRatio ?? videoRatio ? 'fill' : 'contain',
              aspectRatio: extraData?.videoRatio ?? videoRatio,
            }}
            {...rest}
          >
            {children}
          </video>
          <Danmaku />
          {(extraData?.controls ?? controls) && <Controller ref={controllerRef} />}
        </div>

        {extraData?.overlay?.size !== 0 && (
          <div className='mika-video-player-overlay-container'>
            {[...(extraData?.overlay?.values() || [])].map((v, i) => (
              <Fragment key={i}>{v}</Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }),
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
