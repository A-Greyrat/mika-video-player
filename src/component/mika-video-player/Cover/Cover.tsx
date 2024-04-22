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
    console.log(videoElement)

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
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.target !== document.body) return;

            switch (e.key) {
                case ' ':
                    switchPlayState();
                    break;
                case 'Enter':
                    fullscreen(e);
                    break;
                case 'ArrowRight':
                    videoElement && (videoElement.currentTime += 5);
                    break;
                case 'ArrowLeft':
                    videoElement && (videoElement.currentTime -= 5);
                    break;
            }
        };

        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [fullscreen, switchPlayState, videoElement]);

    return (
        <div className="mika-video-player-cover" onPointerDown={(e) => {
            if (e.button === 0) switchPlayState();
        }} ref={coverRef} {...rest}>
            <ToolBar videoElement={videoElement} fullscreen={fullscreen}/>
        </div>
    );
});

Cover.displayName = 'Cover';
export default Cover;
