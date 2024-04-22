import React, {forwardRef, memo, useEffect, useImperativeHandle} from "react";
import "./Message.less";
import ReactDOM from "react-dom/client";

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    duration?: string;
    remainingTime?: number;
    onDisappear?: () => void;
    style?: React.CSSProperties;
    className?: string;
}


// eslint-disable-next-line react-refresh/only-export-components
const Message = memo(forwardRef<HTMLDivElement, MessageProps>((props, ref) => {
    const {children, duration, remainingTime, onDisappear, style, className, ...rest} = props;
    const rootRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    useEffect(() => {
        const _duration = duration || '0.3s';
        rootRef.current && rootRef.current.classList.add("mika-message-appear");
        rootRef.current && rootRef.current.style.setProperty("--duration", `${_duration}`);

        const timer = setTimeout(() => {
            rootRef.current && rootRef.current.addEventListener("animationend", () => {
                onDisappear && onDisappear();
            }, {once: true});

            rootRef.current && rootRef.current.classList.add("mika-message-disappear");
        }, remainingTime || 1000);
        return () => clearTimeout(timer);

    }, [duration, onDisappear, remainingTime]);

    return (
        <div ref={rootRef} style={style} className={`mika-message-root ${className ?? ""}`} {...rest}>
            {children}
        </div>
    );
}));

const showMessage = (props: MessageProps) => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = ReactDOM.createRoot(div);

    const onDisappear = () => {
        document.body.removeChild(div);
    };
    const {children, onDisappear: _onDisappear, ...rest} = props;

    const newOnDisappear = () => {
        _onDisappear && _onDisappear();
        onDisappear();
    };
    const messageComponent = <Message {...rest} onDisappear={newOnDisappear}>{children}</Message>;
    root.render(messageComponent);
}

export default showMessage;