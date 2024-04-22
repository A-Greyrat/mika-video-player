import React, {forwardRef, memo, ReactNode, useCallback, useMemo, useRef, useState} from "react";
import Input from "../Input";
import './AutoComplete.less';
import Dropdown from "../Dropdown";

export interface AutoCompleteProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onSubmit'> {
    type?: 'outline' | 'filled' | 'borderless';
    size?: 'small' | 'medium' | 'large';

    onSubmit?: (item: string) => void;
    dataSrc: string[];
    onValueChange?: (keyword: string) => Promise<unknown>;
    children?: ReactNode;

    onOptionClick?: (item: string) => void;
    onOptionKeyDown?: (item: string) => void;
}

const AutoComplete = memo(forwardRef((props: AutoCompleteProps, ref: React.Ref<HTMLInputElement>) => {
    const {children, dataSrc, className, onSubmit, onValueChange, onOptionClick, onOptionKeyDown, ...rest} = props;
    const olRef = useRef<HTMLOListElement>(null);
    const [value, setValue] = useState('');
    const [curIndex, setCurIndex] = useState(-1);
    const onComposition = useRef(false);
    const [showList, setShowList] = useState(true);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const ol = olRef.current;
            ol && ol.children[curIndex]?.classList.remove('active');
            setCurIndex(e.key === 'ArrowDown' ? Math.min(curIndex + 1, dataSrc.length - 1) : Math.max(curIndex - 1, 0));
            ol && ol.children[curIndex]?.classList.add('active');
            setShowList(true);
        } else if (e.key === 'Enter') {
            if (curIndex !== -1) {
                e.preventDefault();
                onOptionKeyDown?.(dataSrc[curIndex]);
                setShowList(false);
                setCurIndex(-1);
            }
        }
    }, [curIndex, dataSrc, onOptionKeyDown]);

    const DropdownList = useMemo(() => {
        return <ol className='mika-auto-complete-list' ref={olRef} >
            {showList && dataSrc && dataSrc.map((item, index) => {
                return <li key={index} className={curIndex === index ? 'active' : ''}
                           onClick={() => {
                               onOptionClick?.(item);
                               olRef.current?.children[curIndex]?.classList.remove('active');
                               setShowList(false);
                               setCurIndex(-1);
                           }}>{item}</li>;
            })}
        </ol>;
    }, [curIndex, dataSrc, onOptionClick, showList]);

    const onCompositionStart = useCallback(() => {
        onComposition.current = true;
    }, []);

    const onCompositionEnd = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        onComposition.current = false;

        onValueChange?.(e.currentTarget.value).then(() => {
            setShowList(true);
            setCurIndex(-1);
        });
    }, [onValueChange]);

    const _onSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(value);
    }, [onSubmit, value]);

    const onInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        setValue(e.currentTarget.value);
        if (onComposition.current) return;
        onValueChange?.(e.currentTarget.value).then(() => {
            setShowList(true);
            setCurIndex(-1);
        });
    }, [onValueChange]);

    return (
        <Dropdown menu={DropdownList} type='click'>
            <Input ref={ref} {...rest} onKeyDown={handleKeyDown}
                   className={`mika-auto-complete-input ${className ?? ''}`}
                   onSubmit={_onSubmit}
                   value={value}
                   onCompositionStart={onCompositionStart}
                   onCompositionEnd={onCompositionEnd}
                   onInput={onInput}>
                {children}
            </Input>
        </Dropdown>);
}));

AutoComplete.displayName = 'AutoComplete';
export default AutoComplete;
