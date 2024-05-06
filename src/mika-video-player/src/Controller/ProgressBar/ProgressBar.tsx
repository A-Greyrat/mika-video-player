import React, {forwardRef, memo, Ref, useCallback, useContext, useEffect, useImperativeHandle, useRef} from "react";

import './ProgressBar.less';
import {VideoPlayerContext} from "../../VideoPlayerType";
import {isMobile} from "../../Utils";

const ProgressBar = memo(forwardRef((_props: NonNullable<unknown>, ref: Ref<HTMLDivElement>) => {
    const videoElement = useContext(VideoPlayerContext)?.videoElement;
    const barRef = useRef<HTMLDivElement>(null);
    const isSeeking = useRef(false);

    useImperativeHandle(ref, () => barRef.current!);

    const seekPosition = useCallback((e: React.PointerEvent<HTMLDivElement> | PointerEvent | TouchEvent) => {
        if (isSeeking.current && videoElement && videoElement.readyState > 1) {
            let x;
            if (e instanceof TouchEvent) {
                if (e.touches[0] === undefined) return;
                x = e.touches[0].clientX;
            } else {
                x = e.clientX;
            }

            let progress = (x - (barRef.current?.getBoundingClientRect().x ?? 0)) / barRef.current!.clientWidth;
            progress = Math.min(1, Math.max(0, progress));
            barRef.current!.style.setProperty('--mika-video-progress', `${progress * 100}%`);
        }
    }, [videoElement]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        isSeeking.current = true;
        barRef.current!.style.setProperty('--mika-video-progressbar-thumb-visible', 'visible');
        seekPosition(e);
    }, [seekPosition]);

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
        const handlePointerUp = () => {
            if (isMobile()) return;

            if (isSeeking.current && videoElement && videoElement.readyState > 1) {
                const progress = parseFloat(barRef.current!.style.getPropertyValue('--mika-video-progress')) / 100;
                videoElement.currentTime = videoElement.duration * progress;
            }

            isSeeking.current = false;
        };

        const handleTouchEnd = () => {
            if (isSeeking.current && videoElement && videoElement.readyState > 1) {
                const progress = parseFloat(barRef.current!.style.getPropertyValue('--mika-video-progress')) / 100;
                videoElement.currentTime = videoElement.duration * progress;
            }

            isSeeking.current = false;
        }

        const handleSeeked = () => {
            if (videoElement) {
                console.log(videoElement.currentTime)
                videoElement.play().catch(undefined);
            }
        }

        document.addEventListener('pointermove', seekPosition, {capture: true});
        document.addEventListener('pointerup', handlePointerUp, {capture: true});
        document.addEventListener('touchmove', seekPosition, {capture: true});
        document.addEventListener('touchend', handleTouchEnd, {capture: true});

        videoElement?.addEventListener('seeked', handleSeeked);

        return () => {
            document.removeEventListener('pointermove', seekPosition, {capture: true});
            document.removeEventListener('pointerup', handlePointerUp, {capture: true});
            document.removeEventListener('touchmove', seekPosition, {capture: true});
            document.removeEventListener('touchend', handleTouchEnd, {capture: true});

            videoElement?.removeEventListener('seeked', handleSeeked);
        };
    }, [seekPosition, videoElement]);

    return (
        <div className="mika-video-player-progress-bar-wrapper" ref={barRef}
             onPointerDown={handlePointerDown}>
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
