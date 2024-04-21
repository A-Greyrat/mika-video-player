import React, {memo, useCallback, useEffect} from "react";
import ToolBar from "./ToolBar.tsx";
import './Cover.less';

export interface CoverProps extends React.HTMLAttributes<HTMLDivElement> {
    videoRef: React.RefObject<HTMLVideoElement>;
    containerRef: React.RefObject<HTMLDivElement>;
}

const Cover = memo((props: CoverProps) => {
    const {videoRef, containerRef, ...rest} = props;
    const coverRef = React.useRef<HTMLDivElement>(null);

    const switchPlayState = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) videoRef.current.play().catch(undefined);
            else videoRef.current.pause();
        }
    }, [videoRef]);

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

    return (
        <div className="mika-video-player-cover" onPointerDown={(e) => {
            if (e.button === 0) switchPlayState();
        }} ref={coverRef}
             onKeyUp={e => {
                 switch (e.key) {
                     case ' ':
                         switchPlayState();
                         break;
                     case 'Enter':
                         fullscreen(e);
                         break;
                     case 'ArrowRight':
                         if (videoRef.current) videoRef.current.currentTime += 5;
                         break;
                     case 'ArrowLeft':
                         if (videoRef.current) videoRef.current.currentTime -= 5;
                         break;
                 }
             }} tabIndex={0} {...rest}>
            <ToolBar videoElement={videoRef} fullscreen={fullscreen}/>
        </div>
    );
});

export default Cover;
