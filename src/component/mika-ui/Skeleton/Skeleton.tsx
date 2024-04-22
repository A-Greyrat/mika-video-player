import React, {useMemo} from "react";
import './Skeleton.less';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: string;
    height?: string;
    style?: React.CSSProperties;

    type: 'box' | 'avatar' | 'text';
    borderRadius?: string;
    loading?: boolean;
}

const Skeleton = (props: SkeletonProps) => {
    const {type, loading, ...rest} = props;

    const style = useMemo(() => {
        const style = {
            "--skeleton-loading": loading ? '1' : '0',
            ...props.style
        };

        switch (type) {
            case 'box':
                style.width = props.width || '100%';
                style.height = props.height || '100%';
                style.borderRadius = props.borderRadius || '4px';
                break;
            case 'avatar':
                style.width = props.width || '40px';
                style.height = props.height || '40px';
                style.borderRadius = props.borderRadius || '50%';
                break;
            case 'text':
                style.width = props.width || '100%';
                style.height = props.height || '16px';
                style.borderRadius = props.borderRadius || '4px';
                break;
        }

        return style;
    }, [loading, props.style, props.width, props.height, props.borderRadius, type]);

    return (
        <div className="mika-skeleton" style={style} {...rest} />
    );
}

Skeleton.displayName = 'Skeleton';
export default Skeleton;
