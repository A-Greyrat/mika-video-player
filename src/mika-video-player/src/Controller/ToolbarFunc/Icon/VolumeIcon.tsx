import volume from './volume.json';
import React, {memo, useEffect, useRef} from "react";
import {generateUniqueID} from "../../../Utils";
import lottie, {AnimationItem} from 'lottie-web';

const VolumeIcon = memo((props: {
    isMuted: boolean,
    style?: React.CSSProperties
}) => {
    const iconId = useRef<string>(generateUniqueID());
    const [lottieItem, setLottieItem] = React.useState<AnimationItem>();

    useEffect(() => {
        const item = lottie.loadAnimation({
            container: document.querySelector('#mika-video-player-volume-icon-' + iconId.current)!,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: volume,
            name: 'volume',
        });
        const icon = document.querySelector('#mika-video-player-volume-icon-' + iconId.current)?.querySelector('svg');

        icon?.setAttribute('viewBox', '43 43 43 43');
        setLottieItem(item);

        return () => {
            item?.destroy();
        };
    }, []);

    useEffect(() => {
        if (!lottieItem) return;

        if (props.isMuted) {
            lottieItem.setSpeed(2);
            lottieItem.playSegments([1, 35], true);
        } else {
            lottieItem.setSpeed(4);
            lottieItem.playSegments([56, 117], true);
        }
    }, [lottieItem, props.isMuted]);

    return <div id={'mika-video-player-volume-icon-' + iconId.current} style={props.style}/>;
});

VolumeIcon.displayName = 'VolumeIcon';
export default VolumeIcon;
