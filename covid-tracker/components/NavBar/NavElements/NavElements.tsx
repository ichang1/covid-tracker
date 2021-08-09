import { useState } from "react";

import styles from "../../../styles/NavElements.module.scss";
import Link from "next/link";
import Image from "next/image";

interface NavProps {
  children?: React.ReactElement | React.ReactElement[];
}

export function Nav({ children }: NavProps) {
  return <nav className={styles["nav"]}>{children}</nav>;
}

interface NavBarIcon {
  src: any;
  alt?: string;
  title?: string;
}

export function NavBarIcon({ src }: NavBarIcon) {
  return <Image src={src} width="30px" height="30px" objectFit="contain" />;
}

interface NavLinkProps {
  to: string;
  children: React.ReactElement | string;
}

export function NavLink({ to, children }: NavLinkProps) {
  return (
    <div className={styles["nav-link"]}>
      <Link href={to}>{children}</Link>
    </div>
  );
}

interface NavMenuProps {
  children?: React.ReactElement | React.ReactElement[];
}

export function NavMenu({ children }: NavMenuProps) {
  return <div className={styles["nav-menu"]}>{children}</div>;
}

interface DropdownProps {
  icon: String | React.ReactElement;
  children?: React.ReactElement | React.ReactElement[];
}

export function Dropdown({ icon, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["icon-button"]}
        onClick={() => {
          setIsOpen((isOpen) => !isOpen);
        }}
      >
        {icon}
      </div>
      {isOpen && children}
    </div>
  );
}

interface DropdownMenuProps {
  children?: React.ReactElement | React.ReactElement[];
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className={styles["dropdown-menu"]}>{children}</div>;
}

interface DropdownMenuItemProps {
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  children?: React.ReactElement | string;
  href?: string;
}

export function DropdownMenuItem({
  leftIcon,
  rightIcon,
  children,
  href,
}: DropdownMenuItemProps) {
  return (
    <a href={href} className={styles["dropdown-menu-item-container"]}>
      <div className={styles["dropdown-menu-item"]}>
        {leftIcon}
        {children}
        {rightIcon}
      </div>
    </a>
  );
}
