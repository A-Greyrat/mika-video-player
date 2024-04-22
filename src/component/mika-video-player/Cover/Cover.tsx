import React, {memo, useCallback, useEffect} from "react";
import ToolBar from "./ToolBar.tsx";
import './Cover.less';

const DEBUG_MODE = false;

export interface CoverProps extends React.HTMLAttributes<HTMLDivElement> {
    videoElement: HTMLVideoElement | null;
    containerRef: React.RefObject<HTMLDivElement>;
}

const Cover = memo((props: CoverProps) => {
    const {videoElement, containerRef, ...rest} = props;
    const coverRef = React.useRef<HTMLDivElement>(null);

    const switchPlayState = useCallback(() => {
        if (videoElement) {
            if (videoElement.paused) videoElement.play().catch(undefined);
            else videoElement.pause();
        }
    }, [videoElement]);

    const fullscreen = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        if (containerRef.current) {
            if (document.fullscreenElement !== null) document.exitFullscreen().catch(undefined);
            else containerRef.current.requestFullscreen().catch(undefined);
        }
    }, [containerRef]);

    useEffect(() => {
        const cover = coverRef.current;
        const remainingTime = 3000;

        if (DEBUG_MODE) return;

        if (cover) {
            const hideCover = () => {
                cover.style.opacity = '0';
            };

            const showCover = () => {
                cover.style.opacity = '1';
            };

            let timer: number | undefined;
            const handlePointerMove = () => {
                showCover();
                timer && clearTimeout(timer);
                timer = setTimeout(hideCover, remainingTime);
            };

            cover.addEventListener('pointerleave', hideCover);
            cover.addEventListener('pointerenter', showCover);
            cover.addEventListener('pointermove', handlePointerMove);

            return () => {
                cover.removeEventListener('pointerleave', hideCover);
                cover.removeEventListener('pointerenter', showCover);
                cover.removeEventListener('pointermove', handlePointerMove);
            };
        }
    }, []);

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.target !== document.body && e.target !== coverRef.current) return;

            switch (e.key) {
                case ' ':
                    switchPlayState();
                    e.preventDefault();
                    break;
                case 'Enter':
                    fullscreen(e);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    videoElement && (videoElement.currentTime += 5);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    videoElement && (videoElement.currentTime -= 5);
                    e.preventDefault();
                    break;
            }
        };

        const handleContainerKeydown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    videoElement && (videoElement.volume = Math.min(1, videoElement.volume + 0.1));
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowDown':
                    videoElement && (videoElement.volume = Math.max(0, videoElement.volume - 0.1));
                    e.preventDefault();
                    e.stopPropagation();
                    break;
            }
        };

        const cover = coverRef.current;
        cover?.addEventListener('keydown', handleContainerKeydown);

        document.addEventListener('keydown', handleKeydown);


        return () => {
            document.removeEventListener('keydown', handleKeydown);
            cover?.removeEventListener('keydown', handleContainerKeydown);
        };
    }, [switchPlayState, videoElement, fullscreen, coverRef.current]);

    return (
        <div className="mika-video-player-cover" onPointerDown={(e) => {
            if (e.button === 0) switchPlayState();
        }} ref={coverRef} {...rest} tabIndex={0}>
            <ToolBar videoElement={videoElement} fullscreen={fullscreen}/>
        </div>
    );
});

Cover.displayName = 'Cover';
export default Cover;
