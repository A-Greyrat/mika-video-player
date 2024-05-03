import React, {memo, useEffect, useRef} from "react";
import {generateUniqueID} from "../../../Utils";

import play from './playIcon.json';
import lottie from 'lottie-web';

const PlayIcon = memo((props: {
    isPlaying: boolean,
    style?: React.CSSProperties
}) => {
    const iconId = useRef<string>(generateUniqueID());

    useEffect(() => {
        const lottieItem = lottie.loadAnimation({
            container: document.querySelector('#mika-video-player-play-icon-' + iconId.current)!,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: play,
            name: 'play',
        });

        lottieItem.setSpeed(2);
        if (!props.isPlaying) {
            lottieItem.playSegments([1, 24], true);
        } else {
            lottieItem.playSegments([32, 54], true);
        }

        const icon = document.querySelector('#mika-video-player-play-icon-' + iconId.current)?.querySelector('svg');
        icon?.setAttribute('viewBox', '350 350 800 800');

        return () => {
            lottieItem.destroy();
        };
    }, [props.isPlaying]);

    return (
        <div id={'mika-video-player-play-icon-' + iconId.current} style={props.style}/>
    );
});

PlayIcon.displayName = 'PlayIcon';
export default PlayIcon;
