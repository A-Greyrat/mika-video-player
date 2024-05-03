import React, {forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef} from "react";
import defaultLoader from "./Loader/DefaultLoader.ts";
import {Controller, Shortcut} from "./Controller";

import './VideoPlayer.less';
import {DanmakuAttr} from "./Danmaku";
import Danmaku from "./Danmaku/Danmaku.tsx";

export type ToolbarArea = {
    left: React.ComponentType[];
    middle: React.ComponentType[];
    right: React.ComponentType[];
};

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    loader?: (videoElement: HTMLVideoElement) => void;
    toolbar?: ToolbarArea;
    shortcut?: Shortcut[];
    danmaku?: DanmakuAttr[];

    children?: React.ReactNode;
    enableDanmaku?: boolean;

    // 用于传递额外信息
    extra?: unknown;
}

export interface VideoPlayerContextType {
    props: VideoPlayerProps;
    videoElement: HTMLVideoElement | null;
    containerElement: HTMLDivElement | null;
}

export const VideoPlayerContext = React.createContext<VideoPlayerContextType | null>(null);
const VideoPlayer = memo(forwardRef((props: VideoPlayerProps, ref: Ref<HTMLVideoElement>) => {
    const {
        loader,
        controls,
        src,
        width,
        height,
        style,
        toolbar,
        shortcut,
        children,
        danmaku = [],
        enableDanmaku= true,
        ...rest
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => videoRef.current!);
    const [_, forceUpdate] = React.useState(0);

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
                 style={{width: width ?? 'auto', height: height ?? 'auto', ...style}} ref={containerRef}>
                <video crossOrigin="anonymous" ref={videoRef} {...rest}>
                    {children}
                </video>
                {enableDanmaku && <Danmaku/>}
                {controls && <Controller/>}
            </div>
        </VideoPlayerContext.Provider>
    );
}));

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
