import {ToolbarFunc} from "../FuncButton/FuncButton.tsx";
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Dropdown} from "../../../../mika-ui";

import "./SpeedButton.less"

const SpeedButton: ToolbarFunc = memo((props: {
    videoElement?: HTMLVideoElement | null,
}) => {
    const [speed, setSpeed] = useState('1.0');
    const [showDisplay, setShowDisplay] = useState(true);
    const speedItemListRef = useRef(['5.0', '3.0', '2.0', '1.5', '1.25', '1.0', '0.5']);

    useEffect(() => {
        const videoElement = props.videoElement;
        if (!videoElement) return;
        videoElement.playbackRate = parseFloat(speed);
        const handleRateChange = () => {
            if (videoElement.playbackRate === 1.25) setSpeed('1.25');
            else if (videoElement.playbackRate === 0.5) setSpeed('0.5');
            else setSpeed(videoElement.playbackRate.toPrecision(2));
        };
        videoElement.addEventListener('ratechange', handleRateChange);
        return () => {
            videoElement.removeEventListener('ratechange', handleRateChange);
        };
    }, [props.videoElement]);

    const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const videoElement = props.videoElement;
        if (!videoElement) return;

        const speed = (e.target as HTMLDivElement).dataset.speed!;
        videoElement.playbackRate = parseFloat(speed);
        setSpeed(speed);
        setShowDisplay(false);
        setTimeout(() => {
            setShowDisplay(true);
        }, 100);
    }, [props.videoElement]);

    const menu = useMemo( () => {
        return (
            speedItemListRef.current.map((item, index) => {
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
            menu={
                <div className="mika-video-player-toolbar-func-speed-dropdown" style={{
                    display: showDisplay ? 'block' : 'none',
                }}>
                    {menu}
                </div>
            }
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