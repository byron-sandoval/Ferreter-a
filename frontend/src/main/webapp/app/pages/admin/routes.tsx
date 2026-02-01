import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

const AdminDashboard = React.lazy(() => import('./AdminDashboard'));
const ArticuloList = React.lazy(() => import('./ArticuloList'));
const ArticuloUpdate = React.lazy(() => import('./ArticuloUpdate'));
const ProveedorList = React.lazy(() => import('./ProveedorList'));
const CategoriaList = React.lazy(() => import('./categorias/CategoriaList'));
const CategoriaUpdate = React.lazy(() => import('./categorias/CategoriaUpdate'));

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

    <Route
      path="proveedores"
      element={
        <Loadable>
          <ProveedorList />
        </Loadable>
      }
    />

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
  </ErrorBoundaryRoutes>
);

export default AdminRoutes;
