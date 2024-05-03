import React, {forwardRef, memo, useCallback, useMemo} from "react";
import './Dropdown.less';

type DropdownProps = {
    children: React.ReactNode;
    menu: React.ReactNode;
    paddingTrigger?: number;
    direction?: "up" | "down";
    type?: "hover" | "click";
    className?: string;
    position?: "left" | "right" | "center";
    callback?: () => void;
}


const Dropdown = memo(forwardRef((props: DropdownProps, ref: React.Ref<HTMLDivElement>) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [margin, setMargin] = React.useState(0);

    const triggerCallback = useCallback(() => {
        props.callback && props.callback();
    }, [props]);


    React.useEffect(() => {
        const dropdown = dropdownRef?.current;
        const trigger = dropdown?.nextElementSibling as HTMLElement;
        const fn = () => {
            const style = getComputedStyle(dropdownRef.current!);
            if (style.opacity === '1') {
                trigger.blur();
            } else {
                trigger.focus()
            }
        };

        if (trigger) {
            trigger.classList.add(props.type === 'click' ? "mika-dropdown-trigger-click" : "mika-dropdown-trigger");
            setMargin(props.direction === 'up' ? parseFloat(getComputedStyle(trigger).marginTop) : parseFloat(getComputedStyle(trigger).marginBottom));
            props.type === "click" && trigger.addEventListener("click", fn);

            if (props.type === "click") {
                trigger.addEventListener("click", triggerCallback);
            } else {
                trigger.addEventListener("mouseenter", triggerCallback);
            }
        }

        if (dropdown) {
            dropdown.style.setProperty('--mika-dropdown-position-X', (props.position === 'center' || props.position === undefined) ? '-50%' : '0');
        }

        return () => {
            trigger && trigger.removeEventListener(props.type === "click" ? "click" : "mouseenter", triggerCallback);
            trigger && props.type === "click" && trigger.removeEventListener("click", fn);
        }
    }, [props, props.direction, props.position, props.type, triggerCallback]);

    if (props.children === undefined) {
        console.error("Dropdown must have children")
    }

    const dropDownStyle = useMemo(() => ({
        ...(props.direction === "up" ? {
            bottom: '100%',
            marginBottom: `-${margin}px`,
            paddingBottom: props.paddingTrigger ? `${props.paddingTrigger}px` : '0px',
        } : {
            top: '100%',
            marginTop: `-${margin}px`,
            paddingTop: props.paddingTrigger ? `${props.paddingTrigger}px` : '0px',
        }), ...{
            right: props.position === 'right' ? '0' : 'unset',
            left: props.position === 'left' ? '0' : (props.position === 'center' || props.position === undefined) ? '50%' : 'unset',
            transform: (props.position === 'center' || props.position === undefined) ? 'translate3d(-50%, 0, 0)' : 'none',
        }
    }), [props.direction, props.paddingTrigger, props.position, margin]);

    return (<div className={"mika-dropdown-container" + (props.className ? " " + props.className : "")} ref={ref}>
        <div className="mika-dropdown" ref={dropdownRef} style={dropDownStyle}>
            {props.menu}
        </div>
        {props.children}
    </div>);
}));

Dropdown.displayName = 'Dropdown';
export default Dropdown;
