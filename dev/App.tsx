import MarsunCoreProvider from '@/provider/MarsunCoreProvider';
import { applyThemeToCssVariables } from '@/theme';
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ComponentsLayout from './layouts/ComponentsLayout';
import { showcaseRoutes } from './routes';

const App: React.FC = () => {
  useEffect(() => {
    applyThemeToCssVariables('#1677ff');
  }, []);

  const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <MarsunCoreProvider
      auth={{
        isAuthenticated: true,
        hasAnyRole: (roles) => roles.includes('admin'),
        hasPermission: (key) => key === 'user:edit',
      }}
    >
      <BrowserRouter basename={routerBasename || undefined}>
        <Routes>
          <Route path="/components" element={<ComponentsLayout />}>
            <Route index element={<Navigate to="/components/tag" replace />} />
            {showcaseRoutes}
          </Route>
          <Route path="*" element={<Navigate to="/components" replace />} />
        </Routes>
      </BrowserRouter>
    </MarsunCoreProvider>
  );
};

export default App;
