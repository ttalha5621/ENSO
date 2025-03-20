import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import "../App.css";
import { IconContext } from "react-icons";
import Logo from '../assets/ndma_logo.png'
import { Image } from "react-bootstrap";
import { useNavbar } from './NavbarContext';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const { navBackgroundColor } = useNavbar();

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: "undefined" }}>
        <div className="navbar d-flex justify-content-between" style={{ background: navBackgroundColor }}>
          <div className="left">
            <Image src={Logo} alt={'Logo'} width={50} />
            <Link to="#" className="menu-bars">
              <FaIcons.FaBars onClick={showSidebar} />
            </Link>
          </div>
          <div className="center">
            <div className="navbar-title fw-bold">GLOBAL OCEANIC AND ATMOSPHERIC OSCILLATION</div>
          </div>
          <div className="right">
            <div className="navbar-title fw-bold bg-white px-2" style={{color:'green' ,borderRadius:'5px'}}>G-11</div>
          </div>
        </div>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
