import React from 'react';
import { NavLink as Link } from 'react-router-dom';
import { Nav, NavItem, NavLink } from 'reactstrap';
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
} from '@fortawesome/free-solid-svg-icons';

export const Sidebar = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = hasAnyAuthority(account?.authorities || [], [AUTHORITIES.ADMIN]);
  const isVendedor = hasAnyAuthority(account?.authorities || [], [AUTHORITIES.VENDEDOR]);
  const isJefeBodega = hasAnyAuthority(account?.authorities || [], [AUTHORITIES.JEFE_BODEGA]);

  const navLinkStyle = {
    color: '#bdc3c7',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s',
    borderRadius: '4px',
    margin: '4px 0',
  };

  const [empresa, setEmpresa] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/public/empresa')
      .then(res => res.json())
      .then(data => setEmpresa(data))
      .catch(err => console.error('Error fetching business info:', err));
  }, []);

  return (
    <div
      className="sidebar"
      style={{
        width: '260px',
        minHeight: '100vh',
        backgroundColor: '#2c3e50',
        color: '#fff',
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="text-center mb-4 border-bottom pb-3 border-secondary">
        <h4 className="fw-bold mb-0" style={{ color: '#18bc9c' }}>
          {empresa?.nombre || 'FerroNica'}
        </h4>
        <small className="text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          {empresa?.eslogan || 'Gestión de Inventario'}
        </small>
      </div>

      <Nav vertical style={{ flex: 1 }}>
        <NavItem>
          <NavLink tag={Link} to="/" style={navLinkStyle}>
            <FontAwesomeIcon icon={faHome} className="me-3" /> Inicio
          </NavLink>
        </NavItem>

        {(isAdmin || isVendedor) && (
          <>
            <div className="sidebar-heading mt-4 mb-2 text-muted text-uppercase small px-3">Operaciones</div>
            <NavItem>
              <NavLink tag={Link} to="/vendedor" style={navLinkStyle}>
                <FontAwesomeIcon icon={faCashRegister} className="me-3" /> Ventas
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/vendedor/nueva-venta" style={navLinkStyle}>
                <FontAwesomeIcon icon={faPlusCircle} className="me-3" /> Nueva Venta
              </NavLink>
            </NavItem>
          </>
        )}

        {(isAdmin || isJefeBodega) && (
          <>
            <div className="sidebar-heading mt-4 mb-2 text-muted text-uppercase small px-3">Almacén</div>
            <NavItem>
              <NavLink tag={Link} to="/bodeguero" style={navLinkStyle}>
                <FontAwesomeIcon icon={faWarehouse} className="me-3" /> Jefe de Bodega
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/admin/articulos" style={navLinkStyle}>
                <FontAwesomeIcon icon={faBoxes} className="me-3" /> Inventario
              </NavLink>
            </NavItem>
            {isAdmin && (
              <NavItem>
                <NavLink tag={Link} to="/admin/categorias" style={navLinkStyle}>
                  <FontAwesomeIcon icon={faTags} className="me-3" /> Categorías
                </NavLink>
              </NavItem>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <div className="sidebar-heading mt-4 mb-2 text-muted text-uppercase small px-3">Administración</div>
            <NavItem>
              <NavLink tag={Link} to="/admin" style={navLinkStyle}>
                <FontAwesomeIcon icon={faUsersCog} className="me-3" /> Panel Admin
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/admin/usuarios" style={navLinkStyle}>
                <FontAwesomeIcon icon={faUserFriends} className="me-3" /> Usuarios (Negocio)
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/administration/user-management" style={navLinkStyle}>
                <FontAwesomeIcon icon={faUsersCog} className="me-3" /> Usuarios (Sistema)
              </NavLink>
            </NavItem>
          </>
        )}
      </Nav>

      {/* Usuario y Logout al final */}
      <div className="border-top border-secondary pt-3 mt-3">
        <div className="px-3 mb-2">
          <small className="text-muted d-block">Usuario activo:</small>
          <small className="text-white fw-bold">{account?.login || 'Anónimo'}</small>
        </div>
        <NavItem>
          <NavLink tag={Link} to="/logout" style={{ ...navLinkStyle, color: '#e74c3c' }}>
            <FontAwesomeIcon icon={faSignOutAlt} className="me-3" /> Cerrar Sesión
          </NavLink>
        </NavItem>
      </div>
    </div>
  );
};

export default Sidebar;
