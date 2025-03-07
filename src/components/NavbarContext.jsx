import React, { createContext, useState, useContext } from 'react';

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
  const [navBackgroundColor, setNavBackgroundColor] = useState('#1a1a1a'); // Default color

  return (
    <NavbarContext.Provider value={{ navBackgroundColor, setNavBackgroundColor }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  return useContext(NavbarContext);
}