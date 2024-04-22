import React, {forwardRef, memo, useCallback, useMemo} from "react";
import "./Button.less";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: string | React.ReactNode;
    styleType?: 'primary' | 'default' | 'text' | 'link';
    size?: 'small' | 'medium' | 'large';
    // customClickEffect?: string | ((e: HTMLButtonElement) => unknown);
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
}

const Button = memo(forwardRef((props: ButtonProps, ref: React.Ref<HTMLButtonElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {styleType, size, className, onClick, ...htmlProps} = props;
    const btnRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => btnRef.current!);

    const btnClass = useMemo(() => {
        const styleType = props.styleType || 'default';
        const size = props.size || 'medium';
        return `mika-button mika-button-${styleType} mika-button-${size} ${props.className || ''}`;
    }, [props.styleType, props.size, props.className]);
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.disabled) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            const result = onClick(e);
            if (result instanceof Promise) {
                if (!btnRef.current) return;
                btnRef.current.disabled = true;
                btnRef.current.classList.add('mika-button-loading');
                result.finally(() => {
                    if (!btnRef.current) return;
                    btnRef.current.disabled = false;
                    btnRef.current.classList.remove('mika-button-loading');
                });
            }
        }
    }, [props, onClick, btnRef]);

    return (
        <button className={btnClass} ref={btnRef} onClick={handleClick} {...htmlProps}>
            {props.styleType === 'link' ? <span>{props.children}</span> : props.children}
        </button>
    );
}));

Button.displayName = 'Button';
export default Button;
