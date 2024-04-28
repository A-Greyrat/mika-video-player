import React, {memo, useCallback} from "react";
import './FuncButton.less';

const FuncButton = memo((props: {
    icon: React.ReactNode,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    className?: string
}) => {
    const onClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.blur();
        props.onClick?.(e);
    }, [props]);

    return (
        <button onClick={onClick} className={`mika-video-player-func-button ${props.className ?? ''}`}>
            {props.icon}
        </button>
    );
});

FuncButton.displayName = 'FuncButton';
export default FuncButton;
