import React, {memo, useCallback, useContext} from "react";
import ToolBar from "../ToolBar/ToolBar";

import {defaultShortcuts, useShortcut} from "../Shortcut/Shortcut.ts";

import './Controller.less';
import {VideoPlayerContext} from "../../VideoPlayerType";


const Controller = memo(() => {
    const controllerRef = React.useRef<HTMLDivElement>(null);
    const context = useContext(VideoPlayerContext);

    const videoElement = context?.videoElement;
    const containerElement = context?.containerElement;
    const shortcut = context?.props.shortcut || defaultShortcuts;

    const hideController = useCallback(() => {
        controllerRef.current && (controllerRef.current.style.opacity = '0');
    }, []);

    const showController = useCallback(() => {
        controllerRef.current && (controllerRef.current.style.opacity = '1');
    }, []);

    const handlePointerMove = useCallback(() => {
        let timer: number;
        const remainingTime = 3000;

        return () => {
            clearTimeout(timer);
            showController();
            timer = setTimeout(hideController, remainingTime);
        }
    }, [hideController, showController]);

    const [handlePointerDown, handleKeyDown] = useShortcut(shortcut, videoElement, containerElement, controllerRef.current);

    return (
        <div className="mika-video-player-controller" ref={controllerRef} tabIndex={0}
             onPointerMove={handlePointerMove()}
             onPointerLeave={hideController}
             onPointerEnter={showController}
             onPointerDown={handlePointerDown}
             onKeyDown={handleKeyDown}
        >
            <ToolBar/>
        </div>
    );
});

Controller.displayName = 'Controller';
export default Controller;
