import React, {forwardRef, memo, useEffect, useImperativeHandle} from "react";
import ProgressBar from "./ProgressBar.tsx";
import './ToolBar.less';
import PlayIcon from "../Icon/PlayIcon.tsx";
import FullScreenIcon from "../Icon/FullScreenIcon.tsx";

export interface ToolBarProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: React.RefObject<HTMLVideoElement>;
    fullscreen: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const FuncButton = memo((props: {
    icon: React.ReactNode,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className?: string
}) => {
    return (
        <button onClick={props.onClick} className={`mika-video-player-func-button ${props.className ?? ''}`}>
            {props.icon}
        </button>
    );
});

const Timer = memo((props: { videoElement: HTMLVideoElement | null }) => {
    const {videoElement} = props;
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);

    useEffect(() => {
        if (videoElement) {
            const handleTimeUpdate = () => {
                setCurrentTime(videoElement.currentTime);
                setDuration(videoElement.duration);
            };
            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            return () => videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }, [videoElement]);

    return (
        <div className="mika-video-player-timer">
            {duration < 3600 ? new Date(currentTime * 1000).toISOString().substring(14, 19) + ' / ' + new Date(duration * 1000).toISOString().substring(14, 19) :
                new Date(currentTime * 1000).toISOString().substring(11, 19) + ' / ' + new Date(duration * 1000).toISOString().substring(11, 19)}
        </div>
    );
});


const ToolBar = memo(forwardRef((props: ToolBarProps, ref: React.Ref<HTMLDivElement>) => {
    const {videoElement, fullscreen, ...rest} = props;
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => toolbarRef.current!);

    const [isPlaying, setIsPlaying] = React.useState(false);
    const stopPropagation = (e: React.PointerEvent<HTMLDivElement>) => e.stopPropagation();

    useEffect(() => {
        if (videoElement.current) {
            videoElement.current.addEventListener('play', () => setIsPlaying(true));
            videoElement.current.addEventListener('pause', () => setIsPlaying(false));
        }
    }, [videoElement]);

    return (
        <div ref={toolbarRef} className="mika-video-player-toolbar" {...rest}
             onPointerDown={stopPropagation} onPointerMove={stopPropagation} onPointerUp={stopPropagation}>
            <ProgressBar videoElement={videoElement}/>
            <div className="mika-video-player-toolbar-function-container">
                <div className="mika-video-player-toolbar-function-container-left-area">
                    <FuncButton icon={<PlayIcon isPlaying={isPlaying}/>} onClick={() => {
                        if (videoElement.current) {
                            if (videoElement.current.paused) videoElement.current.play().catch(undefined);
                            else videoElement.current.pause();
                        }
                    }}/>
                    <Timer videoElement={videoElement.current}/>
                </div>
                <div className="mika-video-player-toolbar-function-container-middle-area">
                </div>
                <div className="mika-video-player-toolbar-function-container-right-area">
                    <FuncButton icon={<FullScreenIcon/>} onClick={fullscreen}/>
                </div>
            </div>
        </div>
    );
}));

export default ToolBar;
