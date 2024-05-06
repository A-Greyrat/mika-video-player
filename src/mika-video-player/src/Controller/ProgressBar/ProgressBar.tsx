import React, {forwardRef, memo, Ref, useCallback, useContext, useEffect, useImperativeHandle, useRef} from "react";

import './ProgressBar.less';
import {VideoPlayerContext} from "../../VideoPlayerType";

const ProgressBar = memo(forwardRef((_props: NonNullable<unknown>, ref: Ref<HTMLDivElement>) => {
    const videoElement = useContext(VideoPlayerContext)?.videoElement;
    const barRef = useRef<HTMLDivElement>(null);
    const isSeeking = useRef(false);

    useImperativeHandle(ref, () => barRef.current!);

    const seekPosition = useCallback((e: React.PointerEvent<HTMLDivElement> | PointerEvent | TouchEvent) => {
        if (isSeeking.current && videoElement) {
            let x;
            if (e instanceof TouchEvent) {
                x = e.touches[0].clientX;
            } else {
                x = e.clientX;
            }

            let progress = (x - (barRef.current?.getBoundingClientRect().x ?? 0)) / barRef.current!.clientWidth;
            progress = Math.min(1, Math.max(0, progress));
            videoElement.currentTime = videoElement.duration * progress;
            barRef.current!.style.setProperty('--mika-video-progress', `${progress * 100}%`);
        }
    }, [videoElement]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        isSeeking.current = true;
        barRef.current!.style.setProperty('--mika-video-progressbar-thumb-visible', 'visible');
        seekPosition(e);
        videoElement?.pause();
    }, [seekPosition, videoElement]);

    useEffect(() => {
        if (videoElement && barRef.current) {
            const handleTimeUpdate = () => {
                if (isSeeking.current) return;
                let progress = videoElement!.currentTime / videoElement!.duration * 100;
                progress = isNaN(progress) ? 0 : progress;
                barRef.current?.style.setProperty('--mika-video-progress', `${progress}%`)

                const buffer = videoElement!.buffered;
                const bufferEnd = buffer.length > 0 ? buffer.end(buffer.length - 1) : 0;
                let bufferProgress = bufferEnd / videoElement!.duration * 100;
                bufferProgress = isNaN(bufferProgress) ? 0 : bufferProgress;
                barRef.current?.style.setProperty('--mika-video-buffer-progress', `${bufferProgress}%`);
            };

            videoElement?.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [videoElement, barRef]);

    useEffect(() => {
        const handlePointerUp = (e: PointerEvent) => {
            if (!isSeeking.current) return;
            seekPosition(e);
            isSeeking.current = false;
            barRef.current!.style.setProperty('--mika-video-progressbar-thumb-visible', 'hidden');
            videoElement?.play().catch(() => {});
        };

        document.addEventListener('pointermove', seekPosition, {capture: true});
        document.addEventListener('pointerup', handlePointerUp, {capture: true});
        document.addEventListener('touchmove', seekPosition, {capture: true});

        return () => {
            document.removeEventListener('pointermove', seekPosition, {capture: true});
            document.removeEventListener('pointerup', handlePointerUp, {capture: true});
            document.removeEventListener('touchmove', seekPosition, {capture: true});
        };
    }, [seekPosition, videoElement]);

    return (
        <div className="mika-video-player-progress-bar-wrapper" ref={barRef} onPointerDown={handlePointerDown}>
            <div className="mika-video-player-progress-bar-container">
                <div className="mika-video-player-progress-bar-background"/>
                <div className="mika-video-player-progress-bar-buffer"/>
                <div className="mika-video-player-progress-bar"/>
            </div>
            <div className="mika-video-player-progress-bar-thumb"/>
        </div>
    );
}));

ProgressBar.displayName = 'ProgressBar';
export default ProgressBar;
