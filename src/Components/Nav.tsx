import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CgMenu, CgClose } from 'react-icons/cg';

const Nav: React.FC = () => {
  const [open, setOpen] = useState(false);

  const scrollToProducts = () => {
    document.getElementById('productList')?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <nav className="relative">
      <ul className="hidden lg:flex gap-12 items-center uppercase font-large tracking-wide">
        <li>
          <NavLink to="/home" className="inline-block p-[10px] text-[18px] font-medium uppercase
               text-nav-black transition-colors duration-300
               hover:text-nav-helper">
            Home
          </NavLink>
        </li>
        <li>
          <button onClick={scrollToProducts} className="inline-block p-[10px] text-[18px] font-medium uppercase
               text-nav-black transition-colors duration-300
               hover:text-nav-helper">
            CHAIRS
          </button>
        </li>
      </ul>

      <button
        aria-label="Toggle navigation"
        onClick={() => setOpen(!open)}
        className="text-4xl text-primary-blue lg:hidden"
      >
        {open ? <CgClose /> : <CgMenu />}
      </button>

      {open && (
        <ul className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-10
                       bg-white uppercase font-medium text-4xl">
          <li>
            <NavLink to="/home" onClick={() => setOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <button onClick={scrollToProducts}>CHAIRS</button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Nav;
