import React, {forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useRef} from "react";
import './ProgressBar.less';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: React.RefObject<HTMLVideoElement>;
}

const ProgressBar = memo(forwardRef((props: ProgressBarProps, ref: Ref<HTMLDivElement>) => {
    const {videoElement, ...rest} = props;

    const barRef = useRef<HTMLDivElement>(null);
    const isSeeking = useRef(false);

    useImperativeHandle(ref, () => barRef.current!);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        isSeeking.current = true;
    }, []);

    useEffect(() => {
        if (videoElement && barRef.current) {
            videoElement.current?.addEventListener('timeupdate', () => {
                if (isSeeking.current) return;
                const progress = videoElement.current!.currentTime / videoElement.current!.duration * 100;
                barRef.current!.style.setProperty('--mika-video-progress', `${progress}%`)

                const buffer = videoElement.current!.buffered;
                const bufferEnd = buffer.length > 0 ? buffer.end(buffer.length - 1) : 0;
                const bufferProgress = bufferEnd / videoElement.current!.duration * 100;
                barRef.current!.style.setProperty('--mika-video-buffer-progress', `${bufferProgress}%`);
            });
        }
    }, [videoElement, barRef]);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (isSeeking.current && videoElement.current) {
                let progress = (e.clientX - (barRef.current?.getBoundingClientRect().x ?? 0)) / barRef.current!.clientWidth;
                progress = Math.min(1, Math.max(0, progress));
                barRef.current!.style.setProperty('--mika-video-progress', `${progress * 100}%`);
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (!isSeeking.current) return;

            isSeeking.current = false;
            if (videoElement.current) {
                let progress = (e.clientX - (barRef.current?.getBoundingClientRect().x ?? 0)) / barRef.current!.clientWidth;
                progress = Math.min(1, Math.max(0, progress));
                videoElement.current.currentTime = videoElement.current.duration * progress;
            }
        };

        document.addEventListener('pointermove', handlePointerMove, {capture: true});

        document.addEventListener('pointerup', handlePointerUp, {capture: true});

        return () => {
            document.removeEventListener('pointermove', handlePointerMove, {capture: true});
            document.removeEventListener('pointerup', handlePointerUp, {capture: true});
        };
    }, [videoElement]);

    return (
        <div className="mika-video-player-progress-bar-wrapper" ref={barRef}
             onPointerDown={handlePointerDown} {...rest}
        >
            <div className="mika-video-player-progress-bar-background"/>
            <div className="mika-video-player-progress-bar-buffer"/>
            <div className="mika-video-player-progress-bar"/>
            <div className="mika-video-player-progress-bar-indicator"/>
        </div>
    );
}));

export default ProgressBar;
