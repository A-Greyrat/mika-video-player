import React, {memo, useCallback, useEffect} from "react";
import PlayIcon from "./Icon/PlayIcon.tsx";
import FuncButton from "./FuncButton.tsx";
import './PlayButton.less';

const PlayButton = memo((props: {
    videoElement: HTMLVideoElement | null,
}) => {
    const {videoElement} = props;
    const [isPlaying, setIsPlaying] = React.useState(false);

    const onClick = useCallback(() => {
        if (videoElement) {
            if (videoElement.paused) videoElement.play().catch(undefined);
            else videoElement.pause();
            setIsPlaying(!isPlaying);
        }
    }, [videoElement, isPlaying, setIsPlaying]);

    useEffect(() => {
        if (videoElement) {
            videoElement.addEventListener('play', () => setIsPlaying(true));
            videoElement.addEventListener('pause', () => setIsPlaying(false));
        }
    }, [videoElement]);

    return (<FuncButton icon={<PlayIcon isPlaying={isPlaying}/>}
                        onClick={onClick}
                        className="mika-video-player-toolbar-func-play-button"/>
    );
});

PlayButton.displayName = 'PlayButton';
export default PlayButton;
