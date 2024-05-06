import React, {forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef} from "react";
import defaultLoader from "./Loader/DefaultLoader.ts";
import {Controller} from "./Controller";

import './VideoPlayer.less';
import Danmaku from "./Danmaku/Danmaku.tsx";
import {VideoPlayerContext, VideoPlayerProps} from "./VideoPlayerType.ts";
import {defaultShortcuts, useShortcut} from "./Controller/Shortcut/Shortcut.ts";

const VideoPlayer = memo(forwardRef((props: VideoPlayerProps, ref: Ref<HTMLVideoElement>) => {
    const {
        loader,
        controls,
        src,
        width,
        height,
        style,
        toolbar,
        shortcut= defaultShortcuts,
        children,
        danmaku = [],
        enableDanmaku = true,
        ...rest
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => videoRef.current!);
    const [_, forceUpdate] = React.useState(0);

    const handleShortcut = useShortcut(shortcut, videoRef.current, containerRef.current, controllerRef.current);

    useEffect(() => {
        if (loader && videoRef.current) {
            loader(videoRef.current);
        } else if (src) {
            defaultLoader(videoRef.current!, src);
        }
    }, [loader, src, videoRef]);

    useEffect(() => {
        forceUpdate((prev) => prev + 1);
    }, []);

    return (
        <VideoPlayerContext.Provider
            value={{props: props, videoElement: videoRef.current, containerElement: containerRef.current}}>
            <div className="mika-video-player-wrapper"
                 {...handleShortcut} tabIndex={0}
                 style={{width: width ?? 'auto', height: height ?? 'auto', ...style}} ref={containerRef}>
                <video crossOrigin="anonymous" ref={videoRef} {...rest}>
                    {children}
                </video>
                {enableDanmaku && <Danmaku/>}
                {controls && <Controller ref={controllerRef}/>}
            </div>
        </VideoPlayerContext.Provider>
    );
}));

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
