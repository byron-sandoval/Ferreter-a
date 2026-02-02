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
  faTruck,
  faFileInvoice,
  faChartBar,
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
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <div className="top-navbar-container shadow-sm w-100 sticky-top" style={navStyle}>
      <header className="w-100">
        {/* ROW 1: Logo & Brand (Left), User (Right) */}
        <div className="d-flex align-items-center justify-content-between px-4 py-2 border-bottom border-light border-opacity-10">
          <div className="d-flex align-items-center gap-3">
            {/* Logo */}
            <Link to="/" className="text-decoration-none">
              <div
                className="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '42px', height: '42px' }}
              >
                <span className="text-primary fw-bold" style={{ fontSize: '1.1rem' }}>
                  FN
                </span>
              </div>
            </Link>

            {/* Site Name */}
            <div className="text-white">
              <h4 className="m-0 fw-bold tracking-tight" style={{ letterSpacing: '1px' }}>
                FerroNica
              </h4>
              <small className="text-white-50 d-block" style={{ fontSize: '0.65rem', marginTop: '-2px' }}>
                {isAdmin ? 'Panel Administrativo' : isBodeguero ? 'Gestión de Almacén' : 'Punto de Venta'}
              </small>
            </div>
          </div>

          {/* User Section (Right Corner) */}
          <div className="d-flex align-items-center">
            <UncontrolledDropdown nav inNavbar className="list-unstyled">
              <DropdownToggle nav className="p-0">
                <div className="d-flex align-items-center gap-2 text-white opacity-90">
                  <div className="text-end me-1 d-none d-sm-block">
                    <div className="small fw-bold lh-1">{account?.login}</div>
                    <small className="text-white-50" style={{ fontSize: '0.6rem' }}>
                      Online
                    </small>
                  </div>
                  <FontAwesomeIcon icon={faUserCircle} size="2x" className="text-white-50" />
                </div>
              </DropdownToggle>
              <DropdownMenu end className="shadow border-0 mt-2">
                <DropdownItem header>Sesión iniciada</DropdownItem>
                <DropdownItem divider />
                <DropdownItem tag={Link} to="/logout" className="text-danger">
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Salir del sistema
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>

        {/* ROW 2: Navigation Menu */}
        <div className="nav-links-bar w-100 px-3 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <Nav navbar className="flex-row flex-wrap align-items-center no-scrollbar overflow-auto">
            {/* 1. Inicio */}
            <NavItem className="nav-link-item">
              <NavLink tag={Link} to="/" style={navLinkStyle}>
                <FontAwesomeIcon icon={faHome} size="sm" /> Inicio
              </NavLink>
            </NavItem>

            {/* 2. Dashboard */}
            {isAdmin && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/admin" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faUsersCog} size="sm" /> Dashboard
                </NavLink>
              </NavItem>
            )}

            {/* 3. Facturar */}
            {(isAdmin || isVendedor) && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/vendedor/nueva-venta" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faCashRegister} size="sm" /> Facturar
                </NavLink>
              </NavItem>
            )}

            {/* 4. Ventas */}
            {(isAdmin || isVendedor) && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/vendedor/historial-ventas" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faHistory} size="sm" /> Ventas
                </NavLink>
              </NavItem>
            )}

            {/* 5. Compras */}
            {(isAdmin || isBodeguero) && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/bodeguero/ingresos" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faFileInvoice} size="sm" /> Compras
                </NavLink>
              </NavItem>
            )}

            {/* 6. Inventario */}
            {(isAdmin || isVendedor || isBodeguero) && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/vendedor/consulta-inventario" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faWarehouse} size="sm" /> Inventario
                </NavLink>
              </NavItem>
            )}

            {/* 7. Productos */}
            {(isAdmin || isBodeguero) && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/admin/articulos" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faBoxes} size="sm" /> Productos
                </NavLink>
              </NavItem>
            )}

            {/* 8. Categorías */}
            {isAdmin && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/admin/categorias" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faTags} size="sm" /> Categorías
                </NavLink>
              </NavItem>
            )}

            {/* 9. Clientes */}
            {(isAdmin || isVendedor) && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/vendedor/clientes" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faUserFriends} size="sm" /> Clientes
                </NavLink>
              </NavItem>
            )}

            {/* 10. Proveedores */}
            {isAdmin && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/admin/proveedores" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faTruck} size="sm" /> Proveedores
                </NavLink>
              </NavItem>
            )}

            {/* 11. Reportes */}
            {isAdmin && (
              <NavItem className="nav-link-item">
                <NavLink tag={Link} to="/admin/reportes" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faChartBar} size="sm" /> Reportes
                </NavLink>
              </NavItem>
            )}
          </Nav>
        </div>
      </header>
    </div>
  );
};

export default TopNavbar;
