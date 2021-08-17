import React, { useRef } from "react";
import styles from "../../styles/Modal.module.scss";

interface ModalProps {
  modalStyles?: { [key: string]: string | number };
  children: React.ReactElement | React.ReactElement[] | string;
  setIsOpen: (state: boolean) => void;
}
export default function Modal({ children, setIsOpen }: ModalProps) {
  const handleCloseClick = (_: React.MouseEvent) => {
    setIsOpen(false);
  };
  const modalRef = useRef<HTMLDivElement>(null);
  const keydownListener = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      e.key === "Escape" &&
      (target.className === modalRef?.current?.className ||
        target.className.toLowerCase().includes("modal"))
    ) {
      setIsOpen(false);
    }
  };
  return (
    <div
      className="modal-container"
      ref={modalRef}
      onKeyDown={keydownListener}
      tabIndex={-1}
    >
      <div className={styles["modal-nav"]}>
        <button
          className={styles["modal-close-button"]}
          onClick={handleCloseClick}
        >
          ×
        </button>
      </div>
      <div className={styles["modal-content-container"]}>{children}</div>
    </div>
  );
}
