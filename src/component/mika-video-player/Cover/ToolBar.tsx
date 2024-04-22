import React, {forwardRef, memo, useEffect, useImperativeHandle} from "react";
import ProgressBar from "./ProgressBar.tsx";

import './ToolBar.less';
import ToolbarTimer from "./ToolbarFunc/ToolbarTimer.tsx";
import PlayButton from "./ToolbarFunc/PlayButton.tsx";
import FullScreenButton from "./ToolbarFunc/FullScreenButton.tsx";
import VolumeButton from "./ToolbarFunc/VolumeButton.tsx";

export interface ToolBarProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: React.RefObject<HTMLVideoElement>;
    fullscreen: (e: React.MouseEvent<HTMLButtonElement>) => void;
}


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
            <div className="mika-video-player-toolbar-mask"/>
            <ProgressBar videoElement={videoElement}/>
            <div className="mika-video-player-toolbar-function-container">
                <div className="mika-video-player-toolbar-function-container-left-area">
                    <PlayButton videoElement={videoElement} isPlaying={isPlaying} setIsPlaying={setIsPlaying}/>
                    <ToolbarTimer videoElement={videoElement.current}/>
                </div>
                <div className="mika-video-player-toolbar-function-container-middle-area">
                </div>
                <div className="mika-video-player-toolbar-function-container-right-area">
                    <VolumeButton videoElement={videoElement}/>
                    <FullScreenButton fullscreen={fullscreen}/>
                </div>
            </div>
        </div>
    );
}));

ToolBar.displayName = 'ToolBar';
export default ToolBar;
