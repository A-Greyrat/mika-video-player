import React, {memo} from "react";
import FullScreenIcon from "./Icon/FullScreenIcon.tsx";
import FuncButton from "./FuncButton.tsx";

const FullScreenButton = memo((props: {
    fullscreen: (e: React.MouseEvent<HTMLButtonElement>) => void
}) => {
    const {fullscreen} = props;

    return (
        <FuncButton icon={<FullScreenIcon/>} onClick={fullscreen}/>
    );
});

FullScreenButton.displayName = 'FullScreenButton';
export default FullScreenButton;
