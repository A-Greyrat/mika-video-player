import React, {memo, useEffect} from "react";
import {ToolbarFunc} from "../FuncButton/FuncButton";

import './ToolbarTimer.less';

const ToolbarTimer: ToolbarFunc = memo((props: { videoElement?: HTMLVideoElement | null }) => {
    const {videoElement} = props;
    const [currentTime, setCurrentTime] = React.useState(NaN);
    const [duration, setDuration] = React.useState(NaN);

    useEffect(() => {
        if (videoElement) {
            const handleTimeUpdate = () => {
                setCurrentTime(videoElement.currentTime);
                setDuration(videoElement.duration);
            };
            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            videoElement.addEventListener('loadedmetadata', handleTimeUpdate);
            return () => {
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
                videoElement.removeEventListener('loadedmetadata', handleTimeUpdate);
            };
        }
    }, [videoElement]);

    if (!videoElement || isNaN(currentTime) || isNaN(duration)) return null;

    return (
        <div className="mika-video-player-timer">
            {duration < 3600 ? new Date(currentTime * 1000).toISOString().substring(14, 19) + ' / ' + new Date(duration * 1000).toISOString().substring(14, 19) :
                new Date(currentTime * 1000).toISOString().substring(11, 19) + ' / ' + new Date(duration * 1000).toISOString().substring(11, 19)}
        </div>
    );
});

ToolbarTimer.displayName = 'Timer';
export default ToolbarTimer;