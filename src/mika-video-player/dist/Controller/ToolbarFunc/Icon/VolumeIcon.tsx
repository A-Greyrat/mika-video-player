const lottie = await import('lottie-web');
import React, {memo, useEffect, useRef} from "react";

import volume from './volume.json';
import {generateUniqueID} from "../../../Utils";

const VolumeIcon = memo((props: {
    isMuted: boolean,
    style?: React.CSSProperties
}) => {
    const iconId = useRef<string>(generateUniqueID());

    useEffect(() => {
        // @ts-ignore
        const lottieItem = lottie.loadAnimation({
            container: document.querySelector('#mika-video-player-volume-icon-' + iconId.current)!,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: volume,
            name: 'volume',
        });

        if (props.isMuted) {
            lottieItem.setSpeed(2);
            lottieItem.playSegments([1, 35], true);
        } else {
            lottieItem.setSpeed(4);
            lottieItem.playSegments([56, 117], true);
        }

        const icon = document.querySelector('#mika-video-player-volume-icon-' + iconId.current)?.querySelector('svg');
        icon?.setAttribute('viewBox', '43 43 43 43');

        return () => {
            lottieItem.destroy();
        };
    }, [props.isMuted]);

    return <div id={'mika-video-player-volume-icon-' + iconId.current} style={props.style}/>;
});

VolumeIcon.displayName = 'VolumeIcon';
export default VolumeIcon;
