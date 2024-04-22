import React from "react";

export type CarouselListController = {
    prev: () => void;
    next: () => void;
    move: (index: number) => void;

    switchCallback: (payload: number) => unknown;
}

export type CarouselListProps = {
    items: Array<React.ReactNode>;

    itemWidth: string;
    itemHeight?: string;
    itemMargin?: string;

    displayNum: number;
    animationDuration?: number;
    fadeInOut?: boolean;
    autoSwitchByTime?: number;

    cardClass?: string;
    btnClass?: string;
    rootClass?: string;

    controller?: CarouselListController;
    hiddenBtn?: boolean;

    children?: React.ReactNode;
}