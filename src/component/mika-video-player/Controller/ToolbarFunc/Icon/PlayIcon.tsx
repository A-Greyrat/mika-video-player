import React, {memo, useEffect, useRef} from "react";
import {useLottie} from "lottie-react";
import {generateUniqueID} from "../../../Utils";

import play from './playIcon.json';

const PlayIcon = memo((props: {
    isPlaying: boolean,
    style?: React.CSSProperties
}) => {
    const iconId = useRef<string>(generateUniqueID());

    const lottieItem = useLottie({
        animationData: play,
        autoplay: false,
        loop: false,
        style: props.style,
        id: 'mika-video-player-play-icon-' + iconId.current
    });

    useEffect(() => {
        lottieItem.setSpeed(2);
        if (!props.isPlaying) {
            lottieItem.playSegments([1, 24], true);
        } else {
            lottieItem.playSegments([32, 54], true);
        }

        const icon = document.querySelector('#mika-video-player-play-icon-' + iconId.current)?.querySelector('svg');
        icon?.setAttribute('viewBox', '350 350 800 800');
    }, [props.isPlaying, lottieItem]);

    return lottieItem.View;
});

PlayIcon.displayName = 'PlayIcon';
export default PlayIcon;
