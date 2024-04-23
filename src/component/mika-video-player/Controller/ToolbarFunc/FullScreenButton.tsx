import {memo, useCallback} from "react";
import FullScreenIcon from "./Icon/FullScreenIcon";
import FuncButton, {ToolbarFunc} from "./FuncButton";

const FullScreenButton: ToolbarFunc = memo((props: {
    videoElement?: HTMLVideoElement | null,
    containerElement?: HTMLDivElement | null
}) => {
    const {containerElement} = props;

    const fullscreen = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        if (containerElement) {
            if (document.fullscreenElement !== null) document.exitFullscreen().catch(undefined);
            else containerElement.requestFullscreen().catch(undefined);
        }
    }, [containerElement]);

    return (
        <FuncButton icon={<FullScreenIcon/>} onClick={fullscreen}/>
    );
});

FullScreenButton.displayName = 'FullScreenButton';
export default FullScreenButton;
