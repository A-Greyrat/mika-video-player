import React, {forwardRef, memo, useImperativeHandle} from "react";
import ProgressBar from "./ProgressBar.tsx";

import './ToolBar.less';
import ToolbarTimer from "./ToolbarFunc/ToolbarTimer.tsx";
import PlayButton from "./ToolbarFunc/PlayButton.tsx";
import FullScreenButton from "./ToolbarFunc/FullScreenButton.tsx";
import VolumeButton from "./ToolbarFunc/VolumeButton.tsx";

export interface ToolBarProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: HTMLVideoElement | null;
    fullscreen: (e: React.MouseEvent<HTMLButtonElement>) => void;
}


const ToolBar = memo(forwardRef((props: ToolBarProps, ref: React.Ref<HTMLDivElement>) => {
    const {videoElement, fullscreen, ...rest} = props;
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => toolbarRef.current!);

    const stopPropagation = (e: React.PointerEvent<HTMLDivElement>) => e.stopPropagation();

    return (
        <div ref={toolbarRef} className="mika-video-player-toolbar" {...rest}
             onPointerDown={stopPropagation} onPointerMove={stopPropagation} onPointerUp={stopPropagation}>
            <div className="mika-video-player-toolbar-mask"/>
            <ProgressBar videoElement={videoElement}/>
            <div className="mika-video-player-toolbar-function-container">
                <div className="mika-video-player-toolbar-function-container-left-area">
                    <PlayButton videoElement={videoElement}/>
                    <ToolbarTimer videoElement={videoElement}/>
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
