import React, {forwardRef, memo, useCallback, useEffect, useRef} from "react";
import './Modal.less';
import {fadeOutModal} from "./ModalUtils";


export type ModalController = {
    // 仅执行关闭动画，不执行onClose
    close: () => void;
}

export type ModalProps = {
    visible: boolean;

    title?: React.ReactNode | string;
    content?: React.ReactNode | string;
    footer?: React.ReactNode | 'none' | 'ok cancel close' | 'ok cancel' | 'ok close' | 'ok' | 'cancel' | 'close';
    className?: string;
    style?: React.CSSProperties;
    onOk?: () => unknown;
    onCancel?: () => unknown;
    onClose?: () => unknown;
    closeOnClickMask?: boolean;
    showMask?: boolean;
    closeIcon?: boolean | React.ReactNode;
    modalController?: ModalController;
    position?: "top" | "center" | "bottom";
}


const closeModal = ({modalRef, onClose, type}: {
    modalRef: React.RefObject<HTMLDivElement>,
    onClose?: () => unknown,
    type?: "ok" | "cancel" | "close"
}) => {
    if (modalRef.current?.classList.contains("mika-modal-lock")) return;
    modalRef.current?.classList.add("mika-modal-lock");

    if (onClose) {
        const result = onClose();
        if (result instanceof Promise) {
            switch (type) {
                case "ok":
                    modalRef.current?.classList.add("mika-modal-loading-ok");
                    break;
                case "cancel":
                    modalRef.current?.classList.add("mika-modal-loading-cancel");
                    break;
                case "close":
                    modalRef.current?.classList.add("mika-modal-loading-close");
                    break;
            }
        }
    }
}

const Title = memo((props: { title: string | React.ReactNode }) => {
    if (props.title === undefined) return null;
    return typeof props.title === "string" ?
        <div className="mika-modal-title">{props.title}</div> : <>{props.title}</>;
});

const Footer = memo((props: {
    footer?: React.ReactNode | 'none' | 'ok cancel close' | 'ok cancel' | 'ok' | 'cancel';
    onOk?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
    modalRef: React.RefObject<HTMLDivElement>;
}) => {
    const cancel = useCallback(() => {
        closeModal({modalRef: props.modalRef, onClose: props.onCancel, type: "cancel"});
    }, [props.modalRef, props.onCancel]);

    const ok = useCallback(() => {
        closeModal({modalRef: props.modalRef, onClose: props.onOk, type: "ok"});
    }, [props.modalRef, props.onOk]);

    if (props.footer === 'none') return null;
    else if (typeof props.footer === "string" || typeof props.footer === 'undefined') {
        const showOk = props.footer ? props.footer.includes('ok') : false;
        const showCancel = props.footer ? props.footer.includes('cancel') : false;
        const showClose = props.footer ? props.footer.includes('close') : true;

        return (<div className="mika-modal-footer">
            {showOk && <button className="mika-modal-btn mika-modal-btn-ok" onClick={ok}>确定</button>}
            {showCancel &&
                <button className="mika-modal-btn mika-modal-btn-cancel" onClick={cancel}>取消</button>}
            {showClose &&
                <button className="mika-modal-btn mika-modal-btn-close" onClick={props.onClose}>关闭</button>}
        </div>);
    } else return <>{props.footer}</>;
});

const Content = memo((props: { content: string | React.ReactNode }) => {
    if (props.content === undefined) return null;
    return typeof props.content === "string" ?
        <div className="mika-modal-content">{props.content}</div> : <>{props.content}</>;
});

const CloseIcon = memo((props: {
    closeIcon: boolean | React.ReactNode,
    onClose?: () => void
}) => {
    if (props.closeIcon === undefined || props.closeIcon === true)
        return <div className="mika-modal-close" onClick={props.onClose}></div>;
    return props.closeIcon === false ? null : <>{props.closeIcon}</>;
});

const Modal = memo(forwardRef((props: ModalProps, ref: React.Ref<HTMLDivElement>) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const firstRender = React.useRef(true);
    React.useImperativeHandle(ref, () => modalRef.current!);

    const close = useCallback(() => {
        closeModal({modalRef, onClose: props.onClose, type: "close"});
    }, [props.onClose]);


    useEffect(() => {
        if (props.modalController) {
            props.modalController.close = () => fadeOutModal(modalRef);
        }

        if (props.visible) {
            modalRef.current?.classList.remove("mika-modal-closed");
            modalRef.current?.classList.add("mika-modal-opening");
            modalRef.current?.addEventListener("animationend", e => {
                if (e.animationName !== "mika-modal-fade-in") return;
                modalRef.current?.classList.remove("mika-modal-opening");
            });
        } else if (!firstRender.current) {
            fadeOutModal(modalRef);
        }

        modalRef.current?.style.setProperty('--mika-modal-Y', props.position === 'top' ? '-40vh' : props.position === 'bottom' ? '5vh' : '-50%');
    }, [modalRef, props.modalController, props.position, props.visible]);

    if (firstRender.current) {
        firstRender.current = false;
        if (!props.visible) return null;
    }

    return (<div className="mika-modal-wrap" ref={modalRef}>
            <div className="mika-modal-mask"
                 style={{display: props.showMask === undefined || props.showMask ? 'block' : 'none'}}
                 onClick={props.closeOnClickMask ? close : undefined}/>
            <div className='mika-modal-container' ref={ref}>
                <div className={"mika-modal" + (props.className ? ' ' + props.className : '')}
                     style={{...props.style}}>
                    <div className="mika-modal-header">
                        <Title title={props.title}/>
                        <CloseIcon closeIcon={props.closeIcon} onClose={close}/>
                    </div>
                    <Footer footer={props.footer} modalRef={modalRef} onOk={props.onOk} onCancel={props.onCancel}
                            onClose={close}/>
                    <Content content={props.content}/>
                </div>
            </div>
        </div>
    )
}));


export default Modal;
