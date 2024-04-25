import React, {memo, useEffect} from "react";
import {DanmakuType, getDanmakuTracks} from "./Danmaku.ts";

export interface DanmakuProps {
    danmaku: DanmakuType;
}

const Danmaku = memo((props: DanmakuProps) => {
    const {danmaku} = props;
    const ref = React.useRef<HTMLDivElement>(null);

    useEffect(() => {

    }, []);

    return (
        <div className="mika-video-player-danmaku" ref={ref}>
            <div className="mika-video-player-danmaku-content">
                {danmaku.text}
            </div>
        </div>
    );
});

Danmaku.displayName = 'Danmaku';
export default Danmaku;

