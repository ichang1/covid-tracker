import React, { useEffect, useRef } from "react";
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
  const modalRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      console.log(e);
      if (
        e.key === "Escape" &&
        target.className === modalRef?.current?.className
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", keydownListener);
    return () => {
      window.removeEventListener("keydown", keydownListener);
    };
  }, []);
  //   if (!isOpen) {
  //     return null;
  //   }
  return (
    <>
      <button
        className={styles["modal-close-button"]}
        onClick={handleCloseClick}
      >
        ×
      </button>
      <div className={styles["modal-container"]} ref={modalRef}>
        {children}
      </div>
    </>
  );
}
