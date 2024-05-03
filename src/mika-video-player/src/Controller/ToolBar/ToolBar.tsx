import React, {forwardRef, memo, useCallback, useContext, useImperativeHandle} from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import {FullScreenButton, PlayButton, ToolbarTimer, VolumeButton, SpeedButton} from "../ToolbarFunc";

import './ToolBar.less';
import {VideoPlayerContext} from "../../VideoPlayerType";

const DefaultToolbarArea = {
    left: [PlayButton, ToolbarTimer],
    middle: [],
    right: [SpeedButton, VolumeButton, FullScreenButton],
};

const ToolBar = memo(forwardRef((_props: NonNullable<unknown>, ref: React.Ref<HTMLDivElement>) => {
    const context = useContext(VideoPlayerContext)!;
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => toolbarRef.current!);

    const {left: leftArea, middle: middleArea, right: rightArea} = context?.props.toolbar || DefaultToolbarArea;

    const stopPropagation = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }, []);

    return (<>
        <div className="mika-video-player-toolbar-mask"/>
        <div ref={toolbarRef} className="mika-video-player-toolbar" onPointerDown={stopPropagation}>
            <ProgressBar/>
            <div className="mika-video-player-toolbar-function-container">
                <div className="mika-video-player-toolbar-function-container-left-area">
                    {leftArea?.map((item, index) => <React.Fragment key={index}>
                        {React.createElement(item)}
                    </React.Fragment>)}
                </div>
                <div className="mika-video-player-toolbar-function-container-middle-area">
                    {middleArea?.map((item, index) => <React.Fragment key={index}>
                        {React.createElement(item)}
                    </React.Fragment>)}
                </div>
                <div className="mika-video-player-toolbar-function-container-right-area">
                    {rightArea?.map((item, index) => <React.Fragment key={index}>
                        {React.createElement(item)}
                    </React.Fragment>)}
                </div>
            </div>
        </div>
    </>);
}));

ToolBar.displayName = 'ToolBar';
export default ToolBar;
