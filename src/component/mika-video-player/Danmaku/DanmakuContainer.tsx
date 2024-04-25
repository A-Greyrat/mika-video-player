import React, {forwardRef, memo, Ref, useEffect, useImperativeHandle, useRef} from "react";
import {DanmakuType} from "./Danmaku.ts";

export interface DanmakuProps extends React.HTMLAttributes<HTMLDivElement> {
    danmaku: DanmakuType[];
}

const DanmakuContainer = memo(forwardRef((props: DanmakuProps, ref: Ref<HTMLDivElement>) => {
    const {danmaku, ...rest} = props;
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current!);

    useEffect(() => {

    }, []);

    return (<div className="mika-video-player-danmaku" ref={containerRef} {...rest}>

    </div>);
}));

DanmakuContainer.displayName = 'DanmakuContainer';
export default DanmakuContainer;
