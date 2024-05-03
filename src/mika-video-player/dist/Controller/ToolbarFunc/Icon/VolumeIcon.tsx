import {useLottie} from "lottie-react";
import React, {memo, useEffect, useRef} from "react";

import volume from './volume.json';
import {generateUniqueID} from "../../../Utils";

const VolumeIcon = memo((props: {
    isMuted: boolean,
    style?: React.CSSProperties
}) => {
    const iconId = useRef<string>(generateUniqueID());

    const lottieItem = useLottie({
        animationData: volume,
        autoplay: false,
        loop: false,
        style: props.style,
        id: 'mika-video-player-volume-icon-' + iconId.current
    });

    useEffect(() => {
        if (props.isMuted) {
            lottieItem.setSpeed(2);
            lottieItem.playSegments([1, 35], true);
        } else {
            lottieItem.setSpeed(4);
            lottieItem.playSegments([56, 117], true);
        }

        const icon = document.querySelector('#mika-video-player-volume-icon-' + iconId.current)?.querySelector('svg');
        icon?.setAttribute('viewBox', '43 43 43 43');

    }, [lottieItem, props.isMuted]);

    return lottieItem.View;
});

VolumeIcon.displayName = 'VolumeIcon';
export default VolumeIcon;
