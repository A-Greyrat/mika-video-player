import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Dropdown} from "../../../Component";

import "./SpeedButton.less"
import {VideoPlayerContext} from "../../../VideoPlayer.tsx";

const SpeedButton = memo(() => {
    const videoElement = useContext(VideoPlayerContext)?.videoElement;
    const [speed, setSpeed] = useState('1.0');
    const [showDisplay, setShowDisplay] = useState(true);
    const speedItemListRef = useRef(new Map<number, string>([
        [3.0, '3.0'],
        [2.0, '2.0'],
        [1.5, '1.5'],
        [1.25, '1.25'],
        [1.0, '1.0'],
        [0.75, '0.75'],
        [0.5, '0.5'],
    ]));

    const hasSingleDecimalPlace = useCallback((num: number) => {
        if (Math.floor(num) === num) {
            return num.toString() + '.0';
        }
        return num.toString();
    }, []);

    useEffect(() => {
        if (!videoElement) return;
        videoElement.playbackRate = parseFloat(speed);
        const handleRateChange = () => {
            const speed = hasSingleDecimalPlace(videoElement.playbackRate);
            setSpeed(speed);
        };
        videoElement.addEventListener('ratechange', handleRateChange);
        return () => {
            videoElement.removeEventListener('ratechange', handleRateChange);
        };
    }, [speed, videoElement]);

    const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoElement) return;

        const speed = (e.target as HTMLDivElement).dataset.speed!;
        videoElement.playbackRate = parseFloat(speed);
        setSpeed(speed);
        setShowDisplay(false);
        setTimeout(() => {
            setShowDisplay(true);
        }, 100);
    }, [videoElement]);

    const menu = useMemo(() => {
        return (
            Array.from(speedItemListRef.current.values()).map((item, index) => {
                return (
                    <div
                        data-speed={item}
                        key={index}
                        className={"mika-video-player-toolbar-func-speed-dropdown-item" + (speed === item ? '-selected' : '')}
                        onClick={onClick}
                    >
                        {item + 'x'}
                    </div>
                );
            })
        );
    }, [speed, onClick]);

    return (
        <Dropdown
            menu={<div className="mika-video-player-toolbar-func-speed-dropdown"
                       style={{display: showDisplay ? 'block' : 'none',}}>{menu}</div>}
            className="mika-video-player-toolbar-func-speed"
            type="hover"
            direction="up"
            paddingTrigger={10}
        >
            <div className="mika-video-player-toolbar-func-speed-text">{speed === '1.0' ? '倍速' : speed + 'x'}</div>
        </Dropdown>
    );
});

SpeedButton.displayName = 'SpeedButton';
export default SpeedButton;
