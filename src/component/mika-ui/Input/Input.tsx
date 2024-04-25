import React, {forwardRef, memo} from "react";
import './Input.less';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onSubmit'> {
    type?: 'outline' | 'filled' | 'borderless';
    size?: 'small' | 'medium' | 'large';
    value?: string;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    children?: React.ReactNode;
}


const Input = memo(forwardRef((props: InputProps, ref: React.Ref<HTMLInputElement>) => {
    const {type, size, value, className, onSubmit, children, ...rest} = props;

    return (
        <form onSubmit={onSubmit} className={`mika-input-form`}>
            <input value={value}
                   className={`mika-input-${type || 'outline'} mika-input-${size || 'medium'} ${className ?? ''}`}
                   ref={ref} type='text' {...rest} />
            {children}
        </form>);
}));

Input.displayName = 'Input';
export default Input;
