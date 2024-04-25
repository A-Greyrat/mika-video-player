import React, {forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef} from "react";
import defaultLoader from "./Loader/DefaultLoader";
import {Controller, ToolbarFunc, Shortcut} from "./Controller";

import './VideoPlayer.less';
import {DanmakuType} from "./Danmaku/Danmaku.ts";
import DanmakuContainer from "./Danmaku/DanmakuContainer.tsx";

export type ToolbarArea = {
    left: ToolbarFunc[];
    middle: ToolbarFunc[];
    right: ToolbarFunc[];
};

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    loader?: (videoElement: HTMLVideoElement) => void;
    toolbar?: ToolbarArea;
    shortcut?: Shortcut[];
    danmaku?: DanmakuType[];

    children?: React.ReactNode;
}

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
        danmaku= [],
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
        <div className="mika-video-player-wrapper"
             style={{
                 width: width ?? 'auto',
                 height: height ?? 'auto',
                 ...style
             }} ref={containerRef}>

            <video crossOrigin="anonymous" ref={videoRef} {...rest}>
                {children}
            </video>
            {controls && <Controller videoElement={videoRef.current} containerElement={containerRef.current} toolbar={toolbar} shortcut={shortcut}/>}
        </div>
    );
}));

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
