import React from "react";
import Image from "next/image";
import logo from "../../public/logo.png";
import MapIcon from "../../public/map-icon.svg";
import PlaceIcon from "../../public/places-icon.svg";
import TimeSeriesIcon from "../../public/time-series-icon.svg";
import {
  Nav,
  NavBarIcon,
  NavLink,
  NavMenu,
  Dropdown,
  DropdownMenu,
  DropdownMenuItem,
} from "./NavElements/NavElements";
import { FaBars } from "react-icons/fa";
import Link from "next/link";

export default function NavBar() {
  return (
    <Nav>
      <NavLink to="/">
        <Image
          src={logo}
          alt="Icon of globe wearing a face mask"
          objectFit="contain"
          width="60px"
        />
      </NavLink>
      <NavMenu>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/places">Places</NavLink>
        <NavLink to="/api">Api</NavLink>
      </NavMenu>
      <Dropdown icon={<FaBars className="dropdown-icon" />}>
        <DropdownMenu>
          <Link href="/" passHref>
            <DropdownMenuItem
              leftIcon={<NavBarIcon src={MapIcon} />}
              rightIcon={<NavBarIcon src={MapIcon} />}
            >
              Home
            </DropdownMenuItem>
          </Link>
          <Link href="/places" passHref>
            <DropdownMenuItem
              leftIcon={<NavBarIcon src={PlaceIcon} />}
              rightIcon={<NavBarIcon src={PlaceIcon} />}
            >
              Places
            </DropdownMenuItem>
          </Link>
          <Link href="/api" passHref>
            <DropdownMenuItem
              leftIcon={<NavBarIcon src={TimeSeriesIcon} />}
              rightIcon={<NavBarIcon src={TimeSeriesIcon} />}
            >
              Api
            </DropdownMenuItem>
          </Link>
        </DropdownMenu>
      </Dropdown>
    </Nav>
  );
}