import React, {forwardRef, memo, useCallback, useEffect, useRef} from "react";
import './Range.less';


export interface RangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value: number;
    orient?: 'horizontal' | 'vertical';
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    width?: string;
    height?: string;
    thumbSize?: number;
    thumbColor?: string;
    trackColor?: string;
    className?: string;
}

const Range = memo(forwardRef((props: RangeProps, ref: React.Ref<HTMLDivElement>) => {
    const {
        value,
        onChange,
        orient = 'horizontal',
        min = 0,
        max = 100,
        step = 1,
        width = orient === 'horizontal' ? '100%' : '8px',
        height = orient === 'horizontal' ? '8px' : '100%',
        thumbSize = 16,
        thumbColor = 'white',
        trackColor = 'var(--mika-primary-color)',
        className,
        ...rest
    } = props;

    const isControlling = useRef(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const changeValue = useCallback((e: React.PointerEvent | PointerEvent) => {
        if (!isControlling.current || !trackRef.current) return;
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) return;

        const x = e.clientX - rect.left;
        const y = rect.bottom - e.clientY;
        const value = orient === 'horizontal' ? x / rect.width : y / rect.height;
        const newValue = Math.min(max, Math.max(min, min + value * (max - min)));
        onChange(newValue);
    }, [max, min, onChange, orient]);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            changeValue(e);
        };

        const handlePointerUp = (e: PointerEvent) => {
            isControlling.current = false;
            changeValue(e);
        };

        document.addEventListener('pointermove', handlePointerMove, {capture: true});
        document.addEventListener('pointerup', handlePointerUp, {capture: true});

        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            isControlling.current = false;
        };
    }, [changeValue]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        isControlling.current = true;
        changeValue(e);
    }, [changeValue]);

    return (
        <div className={`mika-range ${className ?? ''}`} style={{width: width, height: height}} ref={ref} {...rest}>
            <div className="mika-range-track-background"
                 onPointerDown={handlePointerDown} ref={trackRef}/>

            <div className="mika-range-track"
                 onPointerDown={handlePointerDown}
                 style={{
                     '--track-color': trackColor,
                     left: orient === 'vertical' ? 0 : '-50%',
                     bottom: orient === 'horizontal' ? 0 : '-50%',
                     transform: (orient === 'horizontal' ? `scaleX(${value / max})` : `scaleY(${value / max})`) +
                         ` translate3d(${orient === 'vertical' ? 0 : '50%'}, ${orient === 'horizontal' ? 0 : '-50%'}, 0)`,
                 } as React.CSSProperties}/>

            <div className="mika-range-thumb"
                 onPointerDown={handlePointerDown}
                 style={{
                     '--thumb-color': props.thumbColor,
                     width: thumbSize,
                     height: thumbSize,
                     left: orient === 'horizontal' ? `calc(${value / max * 100}% - ${thumbSize / 2}px)` : '50%',
                     bottom: orient === 'vertical' ? `calc(${value / max * 100}% - ${thumbSize / 2}px)` : undefined,

                     transform: orient === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)',
                 } as React.CSSProperties}/>
        </div>
    );
}));

Range.displayName = 'Range';
export default Range;
