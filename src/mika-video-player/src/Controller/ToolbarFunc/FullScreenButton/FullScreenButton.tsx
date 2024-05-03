import {memo, useCallback, useContext} from "react";
import FullScreenIcon from "../Icon/FullScreenIcon";
import FuncButton from "../FuncButton/FuncButton";
import {VideoPlayerContext} from "../../../VideoPlayerType";

const FullScreenButton = memo(() => {
    const containerElement = useContext(VideoPlayerContext)?.containerElement;

    const fullscreen = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        if (containerElement) {
            if (document.fullscreenElement !== null) document.exitFullscreen().catch(undefined);
            else containerElement.requestFullscreen().catch(undefined);
        }
    }, [containerElement]);

    return (<>
        <FuncButton icon={<FullScreenIcon/>} onClick={fullscreen}/>
    </>);
});

FullScreenButton.displayName = 'FullScreenButton';
export default FullScreenButton;
