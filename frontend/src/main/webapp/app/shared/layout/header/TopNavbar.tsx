import React from 'react';
import { NavLink as Link } from 'react-router-dom';
import { Nav, NavItem, NavLink, Navbar, Container, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faCashRegister,
  faPlusCircle,
  faBoxes,
  faUsersCog,
  faWarehouse,
  faUserFriends,
  faSignOutAlt,
  faTags,
  faUserCircle,
  faHistory,
  faAddressBook,
} from '@fortawesome/free-solid-svg-icons';

export const TopNavbar = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = hasAnyAuthority(account?.authorities || [], [AUTHORITIES.ADMIN]);
  const isVendedor = hasAnyAuthority(account?.authorities || [], [AUTHORITIES.VENDEDOR]);
  const isBodeguero = hasAnyAuthority(account?.authorities || [], [AUTHORITIES.BODEGUERO]);

  const navLinkStyle = {
    color: '#fff',
    padding: '10px 15px',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.2s',
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: '#1a0633', // Deep Purple / Dark Blue like INASOFTWARE
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <div className="top-navbar-container shadow-sm w-100">
      <Navbar expand="md" dark style={navStyle} className="px-4 py-0">
        <div className="d-flex align-items-center w-100">
          {/* Logo / Brand */}
          <Link to="/" className="navbar-brand d-flex align-items-center me-4 py-3">
            <div
              className="bg-white rounded-circle p-1 me-2 d-flex align-items-center justify-content-center"
              style={{ width: '30px', height: '30px' }}
            >
              <span className="text-primary fw-bold" style={{ fontSize: '0.8rem' }}>
                FN
              </span>
            </div>
            <span className="fw-bold fs-5 tracking-tight text-white">FerroNica</span>
          </Link>

          {/* Nav Links */}
          <Nav navbar className="flex-row">
            <NavItem>
              <NavLink tag={Link} to="/" style={navLinkStyle}>
                <FontAwesomeIcon icon={faHome} size="sm" /> Home
              </NavLink>
            </NavItem>

            {(isAdmin || isBodeguero) && (
              <NavItem>
                <NavLink tag={Link} to="/admin/articulos" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faBoxes} size="sm" /> Productos
                </NavLink>
              </NavItem>
            )}

            {(isAdmin || isVendedor) && (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/vendedor/nueva-venta" style={navLinkStyle}>
                    <FontAwesomeIcon icon={faCashRegister} size="sm" /> Facturar
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/vendedor/consulta-inventario" style={navLinkStyle}>
                    <FontAwesomeIcon icon={faBoxes} size="sm" /> Inventario
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/vendedor/historial-ventas" style={navLinkStyle}>
                    <FontAwesomeIcon icon={faHistory} size="sm" /> Ventas
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/vendedor/clientes" style={navLinkStyle}>
                    <FontAwesomeIcon icon={faUserFriends} size="sm" /> Clientes
                  </NavLink>
                </NavItem>
              </>
            )}

            {isAdmin && (
              <NavItem>
                <NavLink tag={Link} to="/admin/categorias" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faTags} size="sm" /> Categorías
                </NavLink>
              </NavItem>
            )}

            {isAdmin && (
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret style={navLinkStyle}>
                  <FontAwesomeIcon icon={faUsersCog} size="sm" /> Admin
                </DropdownToggle>
                <DropdownMenu right className="shadow border-0">
                  <DropdownItem tag={Link} to="/admin">
                    Dashboard Admin
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to="/administration/user-management">
                    Usuarios
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )}
          </Nav>

          {/* User Info & Logout (Right side) */}
          <Nav navbar className="ms-auto flex-row align-items-center">
            <div className="text-end me-3 d-none d-lg-block">
              <div className="text-white small fw-bold" style={{ lineHeight: 1 }}>
                {account?.login}
              </div>
              <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                {isAdmin ? 'Administrador' : isVendedor ? 'Vendedor' : isBodeguero ? 'Bodeguero' : 'Usuario'}
              </small>
            </div>

            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav>
                <FontAwesomeIcon icon={faUserCircle} size="2x" className="text-white-50" />
              </DropdownToggle>
              <DropdownMenu right className="shadow border-0 mt-2">
                <DropdownItem header>Mi Perfil</DropdownItem>
                <DropdownItem tag={Link} to="/account/settings">
                  Configuración
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem tag={Link} to="/logout" className="text-danger">
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Cerrar Sesión
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </div>
      </Navbar>
    </div>
  );
};

export default TopNavbar;
