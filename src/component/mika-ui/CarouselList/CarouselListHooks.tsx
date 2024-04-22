import React, {useCallback, useEffect} from "react";
import {CarouselListController, CarouselListProps} from "./CarouselListType";

export const useStyle = (props: CarouselListProps) => {
    const containerRef = React.useRef<HTMLUListElement>(null);
    const styleRef = React.useRef<HTMLStyleElement>(document.createElement('style'));

    useEffect(() => {
        const item = containerRef.current!.firstChild as HTMLLIElement;
        const style = styleRef.current;

        style.innerHTML = `
            .mika-carousel-list-root {
                --mika-carousel-list-item-width: ${props.itemWidth};
                --mika-carousel-list-item-height: ${props.itemHeight ? props.itemHeight : "initial"};
                --mika-carousel-list-item-animation-duration: ${(props.animationDuration ?? 500) + "ms"};
                --mika-carousel-list-item-fade-in-out: ${props.fadeInOut ? "1" : "0"};
                --mika-carousel-list-item-margin: ${props.itemMargin ?? "0"};
            }`;
        document.head.appendChild(style);

        const cardMargin = parseFloat(getComputedStyle(item).marginRight);
        const itemWidth = item.offsetWidth + cardMargin * 2;
        const rootWidth = itemWidth * props.displayNum;

        style.innerHTML += `
            .mika-carousel-list-root {
                --mika-carousel-list-root-width: ${rootWidth}px;
                --mika-carousel-list-item-move: ${itemWidth}px;
            }    
        `;

        return () => {
            document.head.removeChild(style);
        };
    }, [props.itemWidth, props.displayNum, props.itemHeight, props.itemMargin, props.animationDuration, props.fadeInOut]);

    return containerRef;
};

const useInterval = (props: CarouselListProps) => {
    const intervalRef = React.useRef<number | null>(null);

    useEffect(() => {
        return () => {
            intervalRef.current && clearInterval(intervalRef.current as unknown as number);
        }
    }, []);

    return useCallback((next: () => void) => {
        if (props.autoSwitchByTime) {
            intervalRef.current && clearInterval(intervalRef.current as unknown as number);
            intervalRef.current = setInterval(() => {
                next();
            }, props.autoSwitchByTime);
        }
    }, [props.autoSwitchByTime]);
};

export const useControl = (props: CarouselListProps, containerRef: React.RefObject<HTMLUListElement>) => {
    const leftBtnRef = React.useRef<HTMLButtonElement>(null);
    const rightBtnRef = React.useRef<HTMLButtonElement>(null);
    const currentIndexRef = React.useRef<number>(0);
    const lockRef = React.useRef<boolean>(false);
    const resetInterval = useInterval(props);

    const changeCurrentIndex = useCallback((index: number) => {
        currentIndexRef.current = (index + props.items.length) % props.items.length;
        props.controller?.switchCallback(currentIndexRef.current);
    }, [props.controller, props.items.length]);

    useEffect(() => {
        const leftBtn = leftBtnRef.current!;
        const rightBtn = rightBtnRef.current!;
        const container = containerRef.current!;
        const prev = () => {
            if (lockRef.current) return;
            lockRef.current = true;

            const lastItem = container.lastChild as HTMLLIElement | null;
            if (lastItem == null) {
                console.error("CarouselList: no item to move left.");
                return;
            }
            const nthItem = container.children[props.displayNum - 1] as HTMLLIElement | null;
            if (nthItem == null) {
                console.error("CarouselList: error in displayNum setting.");
                return;
            }

            lastItem.classList.add("mika-carousel-list-item-fade-in-prev");
            nthItem.classList.add("mika-carousel-list-item-fade-out");
            container.classList.add("mika-carousel-list-container-prev-transition");
            container.insertBefore(lastItem, container.firstChild);

            container.onanimationend = ev => {
                if (ev.animationName === "mika-carousel-fade-in" || ev.animationName === "mika-carousel-fade-out") {
                    return;
                }
                container.classList.remove("mika-carousel-list-container-prev-transition");
                lastItem.classList.remove("mika-carousel-list-item-fade-in-prev");
                nthItem.classList.remove("mika-carousel-list-item-fade-out");
                lockRef.current = false;

                changeCurrentIndex(currentIndexRef.current - 1);
            };

            resetInterval(next);
        }
        const next = () => {
            if (lockRef.current) return;
            lockRef.current = true;

            const firstItem = container.firstChild as HTMLLIElement | null;
            if (firstItem == null) {
                console.error("CarouselList: no item to move right.");
                return;
            }
            const nthItem = container.children[props.displayNum] as HTMLLIElement | null;
            if (nthItem == null) {
                console.error("CarouselList: error in displayNum setting.");
                return;
            }

            container.classList.add("mika-carousel-list-container-next-transition");
            firstItem.classList.add("mika-carousel-list-item-fade-out-next");
            nthItem.classList.add("mika-carousel-list-item-fade-in");
            container.appendChild(firstItem);

            container.onanimationend = ev => {
                if (ev.animationName === "mika-carousel-fade-in" || ev.animationName === "mika-carousel-fade-out") {
                    return;
                }
                container.classList.remove("mika-carousel-list-container-next-transition");
                firstItem.classList.remove("mika-carousel-list-item-fade-out-next");
                nthItem.classList.remove("mika-carousel-list-item-fade-in");
                lockRef.current = false;

                changeCurrentIndex(currentIndexRef.current + 1);
            };

            resetInterval(next);
        }
        const move = (index: number) => {
            if (lockRef.current) return;
            lockRef.current = true;

            if (index < 0 || index >= props.items.length) {
                console.error("CarouselList: index out of range.");
                return;
            }
            const moveEndList: HTMLLIElement[] = [];
            const moveStartList: HTMLLIElement[] = [];

            for (let i = 0, flag = false; i < container.children.length; i++) {
                const child = container.children[i] as HTMLLIElement;
                if (child.dataset.key === index.toString()) {
                    flag = true;
                } else {
                    flag ? moveStartList.push(child) : moveEndList.push(child);
                }
            }

            const n = Math.round(props.displayNum / 2) - 1;
            if (moveEndList.length > n) {
                for (let i = 0; i < moveEndList.length - n; i++) {
                    container.appendChild(moveEndList[i]);
                }
            } else {
                for (let i = 0; i < n - moveEndList.length; i++) {
                    container.insertBefore(moveStartList[moveStartList.length - 1 - i], container.firstChild);
                }
            }

            changeCurrentIndex(index);
            lockRef.current = false;

            resetInterval(next);
        }

        if (props.controller) {
            props.controller.prev = prev;
            props.controller.next = next;
            props.controller.move = move;
        }

        if (props.hiddenBtn) {
            leftBtn.style.display = "none";
            rightBtn.style.display = "none";
        } else {
            leftBtn.onclick = prev;
            rightBtn.onclick = next;
        }

        resetInterval(next);

        return () => {
            if (props.controller) {
                props.controller.prev = () => {
                };
                props.controller.next = () => {
                };
            }
        }
    }, [props, changeCurrentIndex, containerRef, resetInterval]);

    return {
        leftBtnRef,
        rightBtnRef,
    };
};

export const useCarouselController = () => {
    const controllerRef = React.useRef<CarouselListController>({
        prev: () => {
        },
        next: () => {
        },
        move: () => {
        },
        switchCallback: () => {
        },
    });

    return controllerRef.current;
}