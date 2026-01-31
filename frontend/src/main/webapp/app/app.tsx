import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAppDispatch, useAppSelector } from './config/store';
import { getSession } from './shared/reducers/authentication';
import { getProfile } from './shared/reducers/application-profile';
import AppRoutes from './routes';
import { MainLayout } from './shared/layout/MainLayout';
import 'react-toastify/dist/ReactToastify.css';
import './app.scss';

export const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSession());
    dispatch(getProfile());
  }, []);

  const currentLocale = useAppSelector(state => state.locale.currentLocale);
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);

  return (
    <BrowserRouter>
      <div className="app-main-container">
        <ToastContainer position={'top-left'} />
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </div>
    </BrowserRouter>
  );
};

export default App;
