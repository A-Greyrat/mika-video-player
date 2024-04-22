import React, {forwardRef, memo, useEffect} from "react";
import {useControl, useStyle} from "./CarouselListHooks";
import {CarouselListProps} from "./CarouselListType";
import "./CarouselList.less";


const LeftButton = forwardRef((props: React.ButtonHTMLAttributes<HTMLButtonElement>, ref: React.Ref<HTMLButtonElement>) => {
    return (
        <button
            className={"mika-carousel-list-btn mika-carousel-list-btn-left" + (props.className ? " " + props.className : "")}
            ref={ref}>
            <svg viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                <path
                    d="M659.748571 245.272381l-51.687619-51.687619-318.439619 318.585905 318.415238 318.268952 51.712-51.736381-266.703238-266.556952z"
                    fill="#8a8a8a"
                ></path>
            </svg>
        </button>
    );
});

const RightButton = forwardRef((props: React.ButtonHTMLAttributes<HTMLButtonElement>, ref: React.Ref<HTMLButtonElement>) => {
    return (
        <button
            className={"mika-carousel-list-btn mika-carousel-list-btn-right" + (props.className ? " " + props.className : "")}
            ref={ref}>
            <svg viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                <path
                    d="M364.251429 778.727619l51.687619 51.687619 318.439619-318.585905-318.415238-318.268952-51.712 51.736381 266.703238 266.556952z"
                    fill="#8a8a8a"
                ></path>
            </svg>
        </button>
    );
});


const CarouselList = memo(forwardRef((props: CarouselListProps, ref: React.Ref<HTMLDivElement>) => {
    const containerRef = useStyle(props);
    const {leftBtnRef, rightBtnRef} = useControl(props, containerRef);

    useEffect(() => {
        if (props.displayNum >= props.items.length) {
            console.error("CarouselList: displayNum is greater than or equal to the number of items.");
        }
    }, [props.displayNum, props.items.length]);

    return (
        <div className={"mika-carousel-list-root" + (props.rootClass ? " " + props.rootClass : "")} ref={ref}>
            <ul className="mika-carousel-list-container" ref={containerRef}>
                {props.items.map((item, index) => (
                    <li className={"mika-carousel-list-item" + (props.cardClass ? " " + props.cardClass : "")}
                        key={index} data-key={index}>
                        {item}
                    </li>
                ))}
            </ul>
            <LeftButton className={props.btnClass} ref={leftBtnRef}/>
            <RightButton className={props.btnClass} ref={rightBtnRef}/>
            {props.children}
        </div>
    );
}));

CarouselList.displayName = 'CarouselList';
export default CarouselList;
