import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

const AdminDashboard = React.lazy(() => import('./AdminDashboard'));
const ArticuloList = React.lazy(() => import('./ArticuloList'));
const ArticuloUpdate = React.lazy(() => import('./ArticuloUpdate'));
const ProveedorList = React.lazy(() => import('./ProveedorList'));
const ProveedorUpdate = React.lazy(() => import('./ProveedorUpdate'));
const CategoriaList = React.lazy(() => import('./categorias/CategoriaList'));
const CategoriaUpdate = React.lazy(() => import('./categorias/CategoriaUpdate'));
const ReportList = React.lazy(() => import('./reportes/ReportList'));
const ComprasPorProveedor = React.lazy(() => import('./reportes/ComprasPorProveedor'));
const ReporteGanancias = React.lazy(() => import('./reportes/ReporteGanancias'));
const ConfiguracionEmpresa = React.lazy(() => import('./configuracion/ConfiguracionEmpresa'));
const GestionUnidadMedida = React.lazy(() => import('./GestionUnidadMedida'));
const UsuarioList = React.lazy(() => import('./UsuarioList'));
const UsuarioUpdate = React.lazy(() => import('./UsuarioUpdate'));
const DevolucionList = React.lazy(() => import('./DevolucionList'));

const Loadable = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    }
  >
    {children}
  </Suspense>
);

const AdminRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route
      index
      element={
        <Loadable>
          <AdminDashboard />
        </Loadable>
      }
    />

    <Route path="articulos">
      <Route
        index
        element={
          <Loadable>
            <ArticuloList />
          </Loadable>
        }
      />
      <Route
        path="new"
        element={
          <Loadable>
            <ArticuloUpdate />
          </Loadable>
        }
      />
      <Route
        path=":id/edit"
        element={
          <Loadable>
            <ArticuloUpdate />
          </Loadable>
        }
      />
    </Route>

    <Route path="proveedores">
      <Route
        index
        element={
          <Loadable>
            <ProveedorList />
          </Loadable>
        }
      />
      <Route
        path="new"
        element={
          <Loadable>
            <ProveedorUpdate />
          </Loadable>
        }
      />
      <Route
        path=":id/edit"
        element={
          <Loadable>
            <ProveedorUpdate />
          </Loadable>
        }
      />
    </Route>

    <Route path="categorias">
      <Route
        index
        element={
          <Loadable>
            <CategoriaList />
          </Loadable>
        }
      />
      <Route
        path="new"
        element={
          <Loadable>
            <CategoriaUpdate />
          </Loadable>
        }
      />
      <Route
        path=":id/edit"
        element={
          <Loadable>
            <CategoriaUpdate />
          </Loadable>
        }
      />
    </Route>

    <Route path="reportes">
      <Route
        index
        element={
          <Loadable>
            <ReportList />
          </Loadable>
        }
      />
      <Route
        path="compras-por-proveedor"
        element={
          <Loadable>
            <ComprasPorProveedor />
          </Loadable>
        }
      />
      <Route
        path="ganancias"
        element={
          <Loadable>
            <ReporteGanancias />
          </Loadable>
        }
      />
    </Route>

    <Route
      path="devoluciones"
      element={
        <Loadable>
          <DevolucionList />
        </Loadable>
      }
    />

    <Route
      path="configuracion"
      element={
        <Loadable>
          <ConfiguracionEmpresa />
        </Loadable>
      }
    />

    <Route
      path="unidades-medida"
      element={
        <Loadable>
          <GestionUnidadMedida />
        </Loadable>
      }
    />
    <Route path="usuarios">
      <Route
        index
        element={
          <Loadable>
            <UsuarioList />
          </Loadable>
        }
      />
      <Route
        path="new"
        element={
          <Loadable>
            <UsuarioUpdate />
          </Loadable>
        }
      />
      <Route
        path=":id/edit"
        element={
          <Loadable>
            <UsuarioUpdate />
          </Loadable>
        }
      />
    </Route>
  </ErrorBoundaryRoutes>
);

export default AdminRoutes;
