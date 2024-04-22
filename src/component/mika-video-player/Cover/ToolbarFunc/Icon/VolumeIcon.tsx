import {useLottie} from "lottie-react";
import volume from './volume.json';
import React, {memo, useEffect} from "react";

const VolumeIcon = memo((props: {
    isMuted: boolean,
    style?: React.CSSProperties
}) => {
    const lottieItem = useLottie({
        animationData: volume,
        autoplay: false,
        loop: false,
        style: props.style,
        className: 'mika-video-player-volume-icon'
    });

    useEffect(() => {
        if (props.isMuted) {
            lottieItem.setSpeed(2);
            lottieItem.playSegments([1, 35], true);
        } else {
            lottieItem.setSpeed(4);
            lottieItem.playSegments([56, 117], true);
        }

        const icon = document.querySelector('.mika-video-player-volume-icon')?.querySelector('svg');
        icon?.setAttribute('viewBox', '43 43 43 43');

    }, [lottieItem, props.isMuted]);

    return lottieItem.View;
});

VolumeIcon.displayName = 'VolumeIcon';
export default VolumeIcon;
