import {forwardRef, memo, Ref} from "react";
import {DanmakuType} from "./Danmaku.ts";

export interface DanmakuProps extends React.HTMLAttributes<HTMLDivElement> {
    danmaku: DanmakuType[];
}

const Danmaku = memo(forwardRef((props: DanmakuProps, ref: Ref<HTMLDivElement>) => {
    const {...rest} = props;

    return (<div {...rest} ref={ref}/>);
}));

export default Danmaku;