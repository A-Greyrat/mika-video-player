import React, {forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef} from "react";
import {DanmakuPool, DanmakuType, IDanmakuPool} from "./Danmaku.ts";
import './Danmaku.less';

export interface DanmakuProps extends React.HTMLAttributes<HTMLDivElement> {
    danmaku: DanmakuType[];
    videoElement: HTMLVideoElement | null;
}

const Danmaku = memo(forwardRef((props: DanmakuProps, ref: Ref<HTMLDivElement>) => {
    const {danmaku, videoElement, ...rest} = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const danmakuPool = useRef<IDanmakuPool | null>(null);
    const currentIndex = useRef(0);
    useImperativeHandle(ref, () => containerRef.current!);

    useEffect(() => {
        if (!videoElement || !containerRef.current || danmakuPool.current) return;
        danmakuPool.current = new DanmakuPool(containerRef.current, videoElement);
        danmaku.sort((a, b) => a.begin - b.begin);

        const handleTimeUpdate = () => {
            if (videoElement.paused) return;

            const currentTime = videoElement.currentTime;
            console.log('currentTime:', currentTime, 'currentIndex:', currentIndex.current, 'danmaku.length:', danmaku.length)
            while (currentIndex.current < danmaku.length && danmaku[currentIndex.current].begin <= currentTime) {
                const minute = Math.floor(danmaku[currentIndex.current].begin / 60);
                const second = Math.floor(danmaku[currentIndex.current].begin % 60);

                console.log('now display danmaku:', danmaku[currentIndex.current].text + ' at ' + minute + ':' + second);
                danmakuPool.current?.addDanmaku(danmaku[currentIndex.current++]);
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
        }

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('seeking', handleSeeking);

        return () => {
            danmakuPool.current?.destroy();
            danmakuPool.current = null;
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('seeked', handleSeeking);
        };
    }, [danmaku, videoElement]);

    return (<div className="mika-video-player-danmaku-container" ref={containerRef} {...rest}/>);
}));

Danmaku.displayName = 'Danmaku';
export default Danmaku;
