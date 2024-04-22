import React, {forwardRef, memo, useEffect, useRef, useState} from "react";
import "./InfinityList.less";

export interface InfinityListProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    onIntersect: (unloading: () => void) => unknown;
    loading?: React.ReactElement;

    limit?: number;
    itemNum?: number;

    options?: IntersectionObserverInit;
}

const DefaultLoading = memo(() => {
    return (<div className="mika-infinity-list-loading"/>);
});

const InfinityList = memo(forwardRef((props: InfinityListProps, ref: React.Ref<HTMLDivElement>) => {
    const [loading, setLoading] = useState(false);
    const detectRef = useRef<HTMLDivElement>(null);
    const {children, onIntersect, loading: loadingEle, itemNum, limit, options, ...rest} = props;

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (loading) return;
                setLoading(true);
                if (limit !== undefined && itemNum !== undefined && limit <= itemNum) {
                    observer.disconnect();
                    setLoading(false);
                } else {
                    onIntersect(() => {
                        setLoading(false);
                    });
                }
            }
        }, (options ?? {
            threshold: 0.1
        }));

        detectRef && detectRef.current && observer.observe(detectRef.current);
        return () => {
            observer.disconnect();
        }
    }, [limit, loading, onIntersect, options, itemNum]);


    return (
        <div ref={ref} className={"mika-infinity-list-root" + (props.className ? " " + props.className : "")}{...rest}>
            {children}
            {loading && (loadingEle ? loadingEle : <DefaultLoading/>)}
            <div className="mika-infinity-list-observer" ref={detectRef}/>
        </div>
    );
}));

InfinityList.displayName = 'InfinityList';
export default InfinityList;
