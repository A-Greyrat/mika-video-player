import React, {useCallback, useMemo} from "react";
import {default as _Button} from "../Button/Button";
import "./Pagination.less";

export interface PaginationProps {
    initIndex?: number;
    pageNum: number;
    maxDisplayNumber?: number;
    onChange: (page: number) => void;
    fastJumpSize?: number;
    customBtn?: (props: PaginationCustomButtonProps) => React.ReactElement;
    customControlBtn?: React.FC<PaginationCustomButtonProps>;

    className?: string;
    style?: React.CSSProperties;
}

export type PaginationCustomButtonProps = {
    onClick: () => void;
    disabled: boolean;
    children?: React.ReactNode;
};


const defaultMaxDisplayNumber = 5;
const defaultFastJumpSize = 5;

const OmitBtn = (props: { onClick: () => void, children?: React.ReactNode }) => {
    return (
        <button onClick={props.onClick} className="mika-pagination-omit-btn">
            <span>···</span>
            {props.children}
        </button>
    );
}

const PageSelector = (props: {
    pageSize: number;
    current: number;
    setCurrent: (page: number) => void;
    onChange: (page: number) => void;
    maxDisplayNumber?: number;
    fastJumpSize?: number;
    customBtn?: React.FC<PaginationCustomButtonProps>;
}) => {
    const omitLeft = useMemo(() => {
        return props.current > (props.maxDisplayNumber || defaultMaxDisplayNumber);
    }, [props]);

    const omitRight = useMemo(() => {
        return props.current <= props.pageSize - (props.maxDisplayNumber || defaultMaxDisplayNumber);
    }, [props]);

    const displayNum = useMemo(() => {
        if (omitLeft && omitRight) {
            return props.maxDisplayNumber || defaultMaxDisplayNumber;
        }
        if (omitLeft || omitRight) {
            return (props.maxDisplayNumber || defaultMaxDisplayNumber) - 1;
        }
        return props.pageSize - 2;
    }, [omitLeft, omitRight, props.maxDisplayNumber, props.pageSize]);

    const Button = props.customBtn || _Button;

    return (
        <div className="mika-pagination-page-selector">
            {props.pageSize > 0 && <Button onClick={() => {
                props.setCurrent(1);
                props.onChange(1);
            }} disabled={props.current === 1}>1</Button>}

            {omitLeft && <OmitBtn onClick={() => {
                props.setCurrent(props.current - (props.fastJumpSize || defaultFastJumpSize));
                props.onChange(props.current - (props.fastJumpSize || defaultFastJumpSize));
            }}>
                <svg viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M485.6 249.9L198.2 498c-8.3 7.1-8.3 20.8 0 27.9l287.4 248.2c10.7 9.2 26.4 0.9 26.4-14V263.8c0-14.8-15.7-23.2-26.4-13.9z m320 0L518.2 498a18.6 18.6 0 0 0-6.2 14c0 5.2 2.1 10.4 6.2 14l287.4 248.2c10.7 9.2 26.4 0.9 26.4-14V263.8c0-14.8-15.7-23.2-26.4-13.9z"
                        fill="#888888"></path>
                </svg>
            </OmitBtn>}

            {Array.from({length: displayNum},
                (_v, i) => {
                    if (!omitLeft) {
                        return i + 2;
                    }
                    if (!omitRight) {
                        return props.pageSize - (props.maxDisplayNumber || defaultMaxDisplayNumber) + i + 1;
                    }
                    return props.current - Math.floor((props.maxDisplayNumber || defaultMaxDisplayNumber) / 2) + i;
                }).map((v) => {
                return <Button key={v} onClick={() => {
                    props.setCurrent(v);
                    props.onChange(v);
                }} disabled={props.current === v}>{v}</Button>
            })}

            {omitRight && <OmitBtn onClick={() => {
                props.setCurrent(props.current + (props.fastJumpSize || defaultFastJumpSize));
                props.onChange(props.current + (props.fastJumpSize || defaultFastJumpSize));
            }}>
                <svg viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M825.8 498L538.4 249.9c-10.7-9.2-26.4-0.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L825.8 526c8.3-7.2 8.3-20.8 0-28z m-320 0L218.4 249.9c-10.7-9.2-26.4-0.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L505.8 526c4.1-3.6 6.2-8.8 6.2-14 0-5.2-2.1-10.4-6.2-14z"
                        fill="#888888"></path>
                </svg>
            </OmitBtn>}

            {props.pageSize > 1 && <Button onClick={() => {
                props.setCurrent(props.pageSize);
                props.onChange(props.pageSize);
            }} disabled={props.current === props.pageSize}>{props.pageSize}</Button>}
        </div>
    );
};

const Pagination = React.forwardRef((props: PaginationProps, ref: React.Ref<HTMLDivElement>) => {
    const [current, setCurrent] = React.useState<number>(props.initIndex || 1);

    const prev = useCallback(() => {
        if (current > 1) {
            setCurrent(current - 1);
            props.onChange(current - 1);
        }
    }, [current, props]);

    const next = useCallback(() => {
        if (current < props.pageNum) {
            setCurrent(current + 1);
            props.onChange(current + 1);
        }
    }, [current, props]);

    const ControlButton = props.customControlBtn || _Button;

    return (
        <div className={"mika-pagination-root" + (props.className ? " " + props.className : "")}
             ref={ref} style={props.style}>
            <ControlButton onClick={prev} disabled={current === 1 || props.pageNum <= 0}>
                {props.customControlBtn ? null :
                    <svg viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                        <path
                            d="M659.748571 245.272381l-51.687619-51.687619-318.439619 318.585905 318.415238 318.268952 51.712-51.736381-266.703238-266.556952z"
                            fill="#8a8a8a"
                        ></path>
                    </svg>}
            </ControlButton>
            <PageSelector pageSize={props.pageNum} current={current} setCurrent={setCurrent}
                          onChange={props.onChange} maxDisplayNumber={props.maxDisplayNumber}
                          fastJumpSize={props.fastJumpSize} customBtn={props.customBtn}/>
            <ControlButton onClick={next} disabled={current === props.pageNum || props.pageNum <= 0}>
                {props.customControlBtn ? null :
                    (<svg viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                        <path
                            d="M364.251429 778.727619l51.687619 51.687619 318.439619-318.585905-318.415238-318.268952-51.712 51.736381 266.703238 266.556952z"
                            fill="#8a8a8a"
                        ></path>
                    </svg>)
                }
            </ControlButton>
        </div>
    )
});

Pagination.displayName = 'Pagination';
export default Pagination;
