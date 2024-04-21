import React, {memo, useEffect} from "react";
import play from './playIcon.json';
import {useLottie} from "lottie-react";


const PlayIcon = memo((props: {
    isPlaying: boolean,
    style?: React.CSSProperties
}) => {
    const lottieItem = useLottie({
        animationData: play,
        autoplay: false,
        loop: false,
        style: props.style
    });

    useEffect(() => {
        lottieItem.setSpeed(2);
        if (!props.isPlaying) {
            lottieItem.playSegments([1, 24], true);
        } else {
            lottieItem.playSegments([32, 54], true);
        }
    }, [props.isPlaying, lottieItem]);

    return lottieItem.View;
});

export default PlayIcon;
