import React, {forwardRef, memo, useEffect} from "react";
import ProgressBar from "./ProgressBar.tsx";
import './ToolBar.less';
import PlayIcon from "./Icon/PlayIcon.tsx";
import PauseIcon from "./Icon/PauseIcon.tsx";
import FullScreenIcon from "./Icon/FullScreenIcon.tsx";

export interface ToolBarProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: React.RefObject<HTMLVideoElement>;
    fullscreen: () => void;
}

const FuncButton = memo((props: {
    icon: React.ReactNode,
    onClick: () => void,
    className?: string
}) => {
    return (
        <button onClick={props.onClick} className={`mika-video-player-func-button ${props.className ?? ''}`}>
            {props.icon}
        </button>
    );
});


const ToolBar = memo(forwardRef((props: ToolBarProps, ref: React.Ref<HTMLDivElement>) => {
    const {videoElement, ...rest} = props;
    const [isPlaying, setIsPlaying] = React.useState(false);
    const stopPropagation = (e: React.PointerEvent<HTMLDivElement>) => e.stopPropagation();

    useEffect(() => {
        if (videoElement.current) {
            videoElement.current.addEventListener('play', () => setIsPlaying(true));
            videoElement.current.addEventListener('pause', () => setIsPlaying(false));
        }
    }, [videoElement]);

    return (
        <div {...rest} ref={ref} className="mika-video-player-toolbar"
             onPointerDown={stopPropagation} onPointerMove={stopPropagation} onPointerUp={stopPropagation}>
            <div className="mika-video-player-toolbar-container">
                <div className="mika-video-player-toolbar-container-left-area">
                    <FuncButton icon={isPlaying ? <PauseIcon/> : <PlayIcon/>} onClick={() => {
                        if (videoElement.current) {
                            if (videoElement.current.paused) videoElement.current.play().catch(undefined);
                            else videoElement.current.pause();
                        }
                    }}/>
                </div>
                <div className="mika-video-player-toolbar-container-middle-area">
                </div>
                <div className="mika-video-player-toolbar-container-right-area">
                    <FuncButton icon={<FullScreenIcon/>} onClick={props.fullscreen}/>
                </div>
            </div>
            <ProgressBar videoElement={videoElement}/>
        </div>
    );
}));

export default ToolBar;
