import React, {useCallback} from "react";
import Modal, {ModalController, ModalProps} from "./Modal";
import {createRoot} from "react-dom/client";
export const fadeOutModal = (modalRef: React.RefObject<HTMLDivElement>) => {
    modalRef.current?.classList.add("mika-modal-closing");
    modalRef.current?.addEventListener("animationend", e => {
        if (e.animationName !== "mika-modal-fade-out") return;
        modalRef.current?.classList.remove("mika-modal-closing");
        modalRef.current?.classList.add("mika-modal-closed");
        modalRef.current?.classList.remove("mika-modal-lock");
        modalRef.current?.classList.remove("mika-modal-loading-ok");
        modalRef.current?.classList.remove("mika-modal-loading-cancel");
        modalRef.current?.classList.remove("mika-modal-loading-close");
    });
};

export const useModal = () => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const modalController = React.useMemo((): ModalController => ({
        close: () => {
            fadeOutModal(modalRef);
        }
    }), [modalRef]);

    return {modalRef, modalController};
};

export const showModal = (props: Omit<Omit<ModalProps, "visible">, "onClose"> & { onClose?: () => unknown }) => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);
    const propsCopy: ModalProps = {...props, visible: true, onClose: props.onClose ?? (() => {})};

    const ModalWrapper = () => {
        const [visible, setVisible] = React.useState(true);
        const close = useCallback(() => {
            setVisible(false);
            setTimeout(() => {
                root.unmount();
                document.body.removeChild(div);
            }, 300);
        }, []);

        const oldOnClose = propsCopy.onClose;
        propsCopy.onClose = () => {
            const result = oldOnClose?.();
            if (result instanceof Promise) {
                return result.then(() => close());
            } else close();
        }

        if (propsCopy.onOk) {
            const oldOnOk = propsCopy.onOk;
            propsCopy.onOk = () => {
                const result = oldOnOk();
                if (result instanceof Promise) {
                    return result.then(() => close());
                } else close();
            }
        }

        if (propsCopy.onCancel) {
            const oldOnCancel = propsCopy.onCancel;
            propsCopy.onCancel = () => {
                const result = oldOnCancel();
                if (result instanceof Promise) {
                    return result.then(() => close());
                } else close();
            }
        }

        return <Modal {...propsCopy} visible={visible}/>
    }
    root.render(<ModalWrapper/>);
};
