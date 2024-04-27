import React, {forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef} from "react";
import {DanmakuPool, DanmakuType} from "./Danmaku.ts";
import './Danmaku.less';

export interface DanmakuProps extends React.HTMLAttributes<HTMLDivElement> {
    danmaku: DanmakuType[];
    videoElement: HTMLVideoElement | null;
}

const Danmaku = memo(forwardRef((props: DanmakuProps, ref: Ref<HTMLDivElement>) => {
    const {danmaku, videoElement, ...rest} = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const danmakuPool = useRef<DanmakuPool | null>(null);
    const currentIndex = useRef(0);
    useImperativeHandle(ref, () => containerRef.current!);

    useEffect(() => {
        if (!videoElement || !containerRef.current || danmakuPool.current) return;
        danmakuPool.current = new DanmakuPool(containerRef.current, videoElement);
        danmaku.sort((a, b) => a.begin - b.begin);
        let lock = false;

        const handleTimeUpdate = () => {
            if (videoElement.paused) return;

            const currentTime = videoElement.currentTime;
            while (currentIndex.current < danmaku.length && danmaku[currentIndex.current].begin <= currentTime) {
                if (lock) {
                    currentIndex.current++;
                    continue;
                }

                // 弹幕时间修正
                const newDanmaku = {...danmaku[currentIndex.current++]};
                newDanmaku.begin = currentTime;
                danmakuPool.current?.addDanmaku(newDanmaku);
            }
        };

        const handleSeeking = () => {
            let l = 0, r = danmaku.length - 1;
            while (l < r) {
                const mid = Math.floor((l + r) / 2);
                if (danmaku[mid].begin < videoElement.currentTime) {
                    l = mid + 1;
                } else {
                    r = mid;
                }
            }

            currentIndex.current = l;
        };

        const handleVisibilityChange = () => {
            lock = document.hidden;
        };

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('seeking', handleSeeking);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            danmakuPool.current?.destroy();
            danmakuPool.current = null;
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('seeked', handleSeeking);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [danmaku, videoElement]);

    return (<div className="mika-video-player-danmaku-container" ref={containerRef} {...rest}/>);
}));

Danmaku.displayName = 'Danmaku';
export default Danmaku;
