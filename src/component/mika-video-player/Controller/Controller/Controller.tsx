import React, {memo, useCallback} from "react";
import ToolBar from "../ToolBar/ToolBar";
import {ToolbarArea} from "../../VideoPlayer";

import {defaultShortcuts, Shortcut, useShortcut} from "../Shortcut/Shortcut.ts";

import './Controller.less';

export interface ControllerProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: HTMLVideoElement | null;
    containerElement: HTMLDivElement | null;
    toolbar?: ToolbarArea;
    shortcut?: Shortcut[];
}

const Controller = memo((props: ControllerProps) => {
    const {
        videoElement,
        containerElement,
        toolbar,
        shortcut = defaultShortcuts,
        ...rest
    } = props;
    const controllerRef = React.useRef<HTMLDivElement>(null);

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
             onKeyDown={handleKeyDown} {...rest}
        >
            <ToolBar videoElement={videoElement} containerElement={containerElement}
                     leftArea={toolbar?.left} middleArea={toolbar?.middle} rightArea={toolbar?.right}/>
        </div>
    );
});

Controller.displayName = 'Controller';
export default Controller;
