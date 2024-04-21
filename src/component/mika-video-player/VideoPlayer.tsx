import React, {forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef} from "react";
import defaultLoader from "./Loader/DefaultLoader";
import './VideoPlayer.less';
import Cover from "./Cover/Cover.tsx";

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    loader?: (videoElement: HTMLVideoElement) => void;
}

const VideoPlayer = memo(forwardRef((props: VideoPlayerProps, ref: Ref<HTMLVideoElement>) => {
    const {
        loader,
        controls,
        src,
        width,
        height,
        style,
        ...rest
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
        if (loader && videoRef.current) {
            loader(videoRef.current);
        } else if (src) {
            defaultLoader(videoRef.current!, src);
        }
    }, [loader, src, videoRef]);

    return (<div className="mika-video-player-wrapper" ref={containerRef} style={{
        width: width ?? 'auto',
        height: height ?? 'auto',
        ...style
    }}>
        <video crossOrigin="anonymous" ref={videoRef} {...rest}/>
        {controls && <Cover videoRef={videoRef} containerRef={containerRef}/>}
    </div>);
}));

export default VideoPlayer;
