import React from 'react';
import { NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Brand = () => (
  <NavbarBrand tag={Link} to="/" className="brand-logo">
    <span className="brand-title">FerroNica</span>
  </NavbarBrand>
);

export const Home = () => (
  <NavItem>
    <NavLink tag={Link} to="/" className="d-flex align-items-center">
      <FontAwesomeIcon icon="home" />
      <span>Inicio</span>
    </NavLink>
  </NavItem>
);
