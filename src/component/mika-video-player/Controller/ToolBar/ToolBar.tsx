import React, {forwardRef, memo, useCallback, useImperativeHandle} from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import {FullScreenButton, PlayButton, ToolbarFunc, ToolbarTimer, VolumeButton} from "../ToolbarFunc";

import './ToolBar.less';

export interface ToolBarProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: HTMLVideoElement | null;
    containerElement: HTMLDivElement | null;

    leftArea?: ToolbarFunc[];
    middleArea?: ToolbarFunc[];
    rightArea?: ToolbarFunc[];
}

const DefaultToolbarArea = {
    left: [PlayButton, ToolbarTimer],
    middle: [],
    right: [VolumeButton, FullScreenButton],
};

const ToolBar = memo(forwardRef((props: ToolBarProps, ref: React.Ref<HTMLDivElement>) => {
    const {
        videoElement,
        containerElement,
        leftArea = DefaultToolbarArea.left,
        middleArea = DefaultToolbarArea.middle,
        rightArea = DefaultToolbarArea.right,
        ...rest
    } = props;
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => toolbarRef.current!);

    const stopPropagation = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <div ref={toolbarRef} className="mika-video-player-toolbar" onPointerDown={stopPropagation} {...rest}>
            <div className="mika-video-player-toolbar-mask"/>
            <ProgressBar videoElement={videoElement}/>
            <div className="mika-video-player-toolbar-function-container">
                <div className="mika-video-player-toolbar-function-container-left-area">
                    {leftArea?.map((item, index) => <React.Fragment key={index}>
                        {React.createElement(item, {videoElement, containerElement})}
                    </React.Fragment>)}
                </div>
                <div className="mika-video-player-toolbar-function-container-middle-area">
                    {middleArea?.map((item, index) => <React.Fragment key={index}>
                        {React.createElement(item, {videoElement, containerElement})}
                    </React.Fragment>)}
                </div>
                <div className="mika-video-player-toolbar-function-container-right-area">
                    {rightArea?.map((item, index) => <React.Fragment key={index}>
                        {React.createElement(item, {videoElement, containerElement})}
                    </React.Fragment>)}
                </div>
            </div>
        </div>
    );
}));

ToolBar.displayName = 'ToolBar';
export default ToolBar;
