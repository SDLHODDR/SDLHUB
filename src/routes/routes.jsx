import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import { routeConfig } from "./routeConfig"; 
import PolicyGuard from "../auth/PolicyGuard";

import NotFound from "../pages/NotFound"; 

const AppRoutes = () => {
  return (

    <Routes>

            {/* Public */}
            {routeConfig.public.map((route, index) => (
                <Route
                key={index}
                path={route.path}
                element={<route.element />}
                />
            ))}

            {/* Protected Layout Wrapper */}
            <Route
            element={
                <ProtectedRoute>
                    <PolicyGuard>
                        <MainLayout />
                    </PolicyGuard>
                </ProtectedRoute>
            }
            >
            {routeConfig.protected.map((route, index) => (
                <Route
                key={index}
                path={route.path}
                element={<route.element />}
                />
            ))}
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />

        </Routes>

    )           
   
};

export default AppRoutes;