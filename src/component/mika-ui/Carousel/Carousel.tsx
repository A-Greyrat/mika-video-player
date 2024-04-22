import './Carousel.less';
import React, {forwardRef, memo, ReactElement, useCallback, useEffect, useImperativeHandle, useRef} from "react";
import {useTimer, withLockTime} from "../utils";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
    items: ReactElement[];

    loop?: boolean;
    autoSwitchByTime?: number;
    direction?: "horizontal" | "vertical";
    initialIndex?: number;

    onSwitch?: (index: number) => void;
    className?: string;
}

const handleErrors = (props: CarouselProps) => {
    if (props.direction === "vertical") {
        throw new Error("Carousel: vertical direction is not supported yet.");
    }
    if (props.items.length < 1) {
        throw new Error("Carousel: items should not be empty.");
    }
}

const PrevButton = forwardRef((props: React.ButtonHTMLAttributes<HTMLButtonElement>, ref: React.Ref<HTMLButtonElement>) => {
    return (
        <button
            className={"mika-carousel-btn mika-carousel-btn-prev" + (props.className ? " " + props.className : "")}
            ref={ref} {...props}>
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

const NextButton = forwardRef((props: React.ButtonHTMLAttributes<HTMLButtonElement>, ref: React.Ref<HTMLButtonElement>) => {
    return (
        <button
            className={"mika-carousel-btn mika-carousel-btn-next" + (props.className ? " " + props.className : "")}
            ref={ref} {...props}>
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

const CarouselHorizontal = memo(forwardRef((props: Omit<CarouselProps, "direction">, ref: React.Ref<HTMLDivElement>) => {
    const containerRef = React.useRef<HTMLUListElement>(null);
    const currentIndex = useRef<number>(props.initialIndex ?? 0);
    const observer = useRef<IntersectionObserver | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSwitch = useCallback(withLockTime((index: number, nowPosition?: string) => {
        props.onSwitch && props.onSwitch(index);
        const container = containerRef.current;
        if (!container) {
            console.error("[Mika UI] Carousel: container is not found.");
            return;
        }

        if (index < 0) {
            currentIndex.current = props.items.length - 1;
            container.style.transition = "none";
            container.style.transform = `translateX(-${(currentIndex.current + 2) * 100}%) ` + (nowPosition ? ` ${nowPosition}` : "");
            container.offsetWidth;
            container.style.transition = "";
            container.style.transform = `translateX(-${(currentIndex.current + 1) * 100}%)`;
        } else if (index >= props.items.length) {
            currentIndex.current = 0;
            container.style.transition = "none";
            container.style.transform = `translateX(0) ` + (nowPosition ? ` ${nowPosition}` : "");
            container.offsetWidth;
            container.style.transition = "";
            container.style.transform = `translateX(-100%)`;
        } else {
            currentIndex.current = index;
            container.style.transition = "";
            container.style.transform = `translateX(-${(currentIndex.current + 1) * 100}%)`;
        }
    }, 300), [props]);

    const next = useCallback(() => {
        handleSwitch(currentIndex.current + 1);
    }, [handleSwitch]);

    const [start, stop, reset] = useTimer(next, props.autoSwitchByTime ?? 0);

    useEffect(() => {
        if (props.autoSwitchByTime) {
            observer.current = new IntersectionObserver((entries) => {
                entries[0].isIntersecting ? start() : stop();
            });

            rootRef.current && observer.current.observe(rootRef.current);
        }

        return () => {
            stop();
            observer.current?.disconnect();
        };
    }, [props.autoSwitchByTime, start, stop]);

    const startTouch = useRef<number>(0);
    const TouchStart = useCallback((e: React.TouchEvent) => {
        const container = containerRef.current;
        if (!container) {
            console.error("[Mika UI] Carousel: container is not found.");
            return;
        }
        stop();
        const touch = e.touches[0];
        startTouch.current = touch.clientX;
    }, [stop]);
    const TouchMove = useCallback((e: React.TouchEvent) => {
        const container = containerRef.current;
        if (!container) {
            console.error("[Mika UI] Carousel: container is not found.");
            return;
        }

        const touch = e.touches[0];
        const deltaX = touch.clientX - startTouch.current;
        const width = rootRef.current?.offsetWidth ?? 0;

        if (Math.abs(deltaX) > width) {
            return;
        }

        container.style.transition = "none";
        container.style.transform = `translateX(-${(currentIndex.current + 1) * 100}%) translateX(${deltaX}px)`;
    }, []);
    const TouchEnd = useCallback((e: React.TouchEvent) => {
        start();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startTouch.current;
        const width = rootRef.current?.offsetWidth ?? 0;

        if (deltaX === 0)
            return;

        if (Math.abs(deltaX) > width / 4) {
            if (deltaX > 0) {
                handleSwitch(currentIndex.current - 1, `translateX(${deltaX}px`);
            } else {
                handleSwitch(currentIndex.current + 1, `translateX(${deltaX}px`);
            }
        } else {
            handleSwitch(currentIndex.current, `translateX(${deltaX}px`);
        }

    }, [handleSwitch, start]);

    return (
        <div className={"mika-carousel-horizontal-root" + (props.className ? " " + props.className : "")}
             ref={rootRef} onTouchStart={TouchStart} onTouchMove={TouchMove}
             onMouseEnter={() => {stop();}} onMouseLeave={() => {start();}} onTouchEnd={TouchEnd}
             {...props}
        >
            <ul className="mika-carousel-horizontal-container" style={{
                transform: `translateX(-${(currentIndex.current + 1) * 100}%)`,
            }} ref={containerRef}>
                <li className="mika-carousel-horizontal-item" key={-1} data-key={-1}>
                    {props.items[props.items.length - 1]}
                </li>
                {props.items.map((item, index) => (
                    <li className="mika-carousel-horizontal-item" key={index} data-key={index}>
                        {item}
                    </li>
                ))}
                <li className="mika-carousel-horizontal-item" key={props.items.length} data-key={props.items.length}>
                    {props.items[0]}
                </li>
            </ul>

            <PrevButton onClick={() => {
                handleSwitch(currentIndex.current - 1);
                reset();
            }}/>

            <NextButton onClick={() => {
                handleSwitch(currentIndex.current + 1);
                reset();
            }}/>

        </div>
    );
}));

const Carousel = memo(forwardRef((props: CarouselProps, ref: React.Ref<HTMLDivElement>) => {
    handleErrors(props);
    return <CarouselHorizontal {...props} ref={ref}/>;
}));

Carousel.displayName = 'Carousel';
export default Carousel;
