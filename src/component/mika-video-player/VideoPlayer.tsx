import React, {forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useRef} from "react";
import defaultLoader from "./Loader/DefaultLoader";
import './VideoPlayer.less';
import ToolBar from "./ToolBar.tsx";

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    loader?: (videoElement: HTMLVideoElement) => void;
}

const VideoPlayer = memo(forwardRef((props: VideoPlayerProps, ref: Ref<HTMLVideoElement>) => {
    const {loader, controls, src, ...rest} = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => videoRef.current!);

    const switchPlayState = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) videoRef.current.play().catch(undefined);
            else videoRef.current.pause();
        }
    }, [videoRef]);

    const fullscreen = useCallback(() => {
        if (containerRef.current) {
            if (document.fullscreenElement === containerRef.current) document.exitFullscreen().then(undefined);
            else containerRef.current.requestFullscreen().catch(undefined);
        }
    }, [containerRef]);

    useEffect(() => {
        if (loader && videoRef.current) {
            loader(videoRef.current);
        } else if (src) {
            defaultLoader(videoRef.current!, src);
        }
    }, [loader, src, videoRef]);

    return (<div className="mika-video-player-wrapper" ref={containerRef}>
        <video {...rest} ref={videoRef}/>
        <div className="mika-video-player-cover" onPointerDown={switchPlayState}
             onKeyUp={e => {
                 switch (e.key) {
                     case ' ':
                         switchPlayState();
                         break;
                     case 'Enter':
                         fullscreen();
                         break;
                     case 'ArrowRight':
                         if (videoRef.current) videoRef.current.currentTime += 5;
                         break;
                     case 'ArrowLeft':
                         if (videoRef.current) videoRef.current.currentTime -= 5;
                         break;
                 }
             }} tabIndex={0}>
            <ToolBar videoElement={videoRef} fullscreen={fullscreen} />
        </div>

    </div>);
}));

export default VideoPlayer;
