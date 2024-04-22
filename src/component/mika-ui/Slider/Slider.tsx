import React, {forwardRef, memo, useEffect} from "react";
import './Slider.less';


export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    showValue?: boolean;
    width?: string;
    height?: string;

    orient: 'horizontal' | 'vertical';
    thumbColor?: string;
    trackColor?: string;
}


const SliderInput = memo((props: SliderProps & {
    setValue: (value: string) => void;
    ref: React.Ref<HTMLInputElement>,
}) => {
    const {
        ref,
        className,
        value,
        width,
        onChange,
        setValue,
        orient = 'horizontal',
        ...rest
    } = props;

    return <input ref={ref} className={`mika-slider ${className ?? ''}`}
                  value={value}
                  onChange={(e) => {
                      setValue(e.target.value);
                      onChange && onChange(e);
                  }}
                  style={{
                      width: width,
                      '--thumb-color': props.thumbColor,
                      '--track-color': props.trackColor,
                  } as React.CSSProperties}
                  type='range' {...rest} />;
});


const Slider = memo(forwardRef((props: SliderProps, ref: React.Ref<HTMLInputElement>) => {
    const {
        className,
        value: _value = 0,
        showValue,
        ...rest
    } = props;
    const [value, setValue] = React.useState(_value ?? '0');

    useEffect(() => {
        setValue(_value);
    }, [_value]);

    if (!showValue) {
        return <SliderInput value={value} ref={ref} setValue={setValue} className={className} {...rest} />;
    }

    return (<div className='mika-slider-root'>
            <SliderInput value={value} ref={ref} setValue={setValue} className={className} {...rest} />
            {showValue && <span style={{
                color: props.thumbColor,
            }}>{value}</span>}
        </div>
    );
}));

Slider.displayName = 'Slider';
export default Slider;
