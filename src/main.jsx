import { StrictMode } from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./shared/auth/AuthProvider.jsx";
import App from './App.jsx'
import "./shared/assets/css/eportal.css";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./shared/assets/icons/tabler-icons/tabler-icons.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "./shared/assets/icons/feather/css/iconfont.css";
import "./shared/assets/css/feather.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./customStyle.scss";
import "../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "../node_modules/sweetalert2/dist/sweetalert2.min.css";
import "./shared/assets/css/sweetalert.css";
import "./shared/assets/css/portal.css";

import { Provider } from "react-redux";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import { store } from "./app/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        {/* Last resort for errors outside the page area (header, menu, login). */}
        <ErrorBoundary variant="app">
            <BrowserRouter>
                <Provider store={store}>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </Provider>
            </BrowserRouter>
        </ErrorBoundary>
    </StrictMode>,
);
