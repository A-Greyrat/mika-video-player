import React, {memo, useCallback} from "react";
import PlayIcon from "./Icon/PlayIcon.tsx";
import FuncButton from "./FuncButton.tsx";
import './PlayButton.less';

const PlayButton = memo((props: {
    videoElement: React.RefObject<HTMLVideoElement>,
    isPlaying: boolean,
    setIsPlaying: (isPlaying: boolean) => void
}) => {
    const {videoElement, isPlaying, setIsPlaying} = props;
    const onClick = useCallback(() => {
        if (videoElement.current) {
            if (videoElement.current.paused) videoElement.current.play().catch(undefined);
            else videoElement.current.pause();
            setIsPlaying(!isPlaying);
        }
    }, [videoElement, isPlaying, setIsPlaying]);


    return (<FuncButton icon={<PlayIcon isPlaying={isPlaying}/>}
                        onClick={onClick}
                        className="mika-video-player-toolbar-func-play-button"/>
    );
});

PlayButton.displayName = 'PlayButton';
export default PlayButton;
