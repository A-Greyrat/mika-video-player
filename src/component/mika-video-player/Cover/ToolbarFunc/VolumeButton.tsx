import {memo, useCallback, useEffect, useState} from "react";
import VolumeIcon from "./Icon/VolumeIcon.tsx";
import FuncButton from "./FuncButton.tsx";
import {Dropdown, Range} from "../../../mika-ui";

import './VolumeButton.less';

const VolumeButton = memo((props: {
    videoElement: HTMLVideoElement | null,
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [_, forceUpdate] = useState(0);

    useEffect(() => {
        const videoElement = props.videoElement;
        if (!videoElement) return;

        const handleVolumeChange = () => {
            setIsMuted(videoElement.volume === 0 || videoElement.muted);
        };

        videoElement.addEventListener('volumechange', handleVolumeChange);
        return () => {
            videoElement.removeEventListener('volumechange', handleVolumeChange);
        };
    }, [props.videoElement]);

    const onClick = useCallback(() => {
        const videoElement = props.videoElement;
        if (!videoElement) return;

        videoElement.muted = !videoElement.muted;
        setIsMuted(videoElement.muted);
    }, [props.videoElement]);

    const onChange = useCallback((value: number) => {
        const videoElement = props.videoElement;
        if (!videoElement) return;

        forceUpdate(value => value + 1);
        videoElement.volume = value / 100;
        videoElement.muted = false;
    }, [props.videoElement]);

    return (
        <Dropdown menu={(
            <div className="mika-video-player-toolbar-func-volume-dropdown">
                <Range className="mika-video-player-toolbar-func-volume-slider"
                       value={isMuted ? 0 : (props.videoElement?.volume ?? 0) * 100}
                       max={100}
                       onChange={onChange}
                       width="3px"
                       height="80px"
                       thumbSize={8}
                       orient="vertical"
                />
            </div>)}
                  className="mika-video-player-toolbar-func-volume"
                  type="hover"
                  direction="up"
                  paddingTrigger={5}
        >
            <FuncButton icon={<VolumeIcon isMuted={isMuted}/>}
                        onClick={onClick}
                        className="mika-video-player-toolbar-func-volume-button"/>
        </Dropdown>
    );
});

VolumeButton.displayName = 'VolumeButton';
export default VolumeButton;
