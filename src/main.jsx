import { StrictMode } from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider.jsx";
import App from './App.jsx'
import "./assets/css/eportal.css";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/icons/tabler-icons/tabler-icons.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "./assets/icons/feather/css/iconfont.css";
import "./assets/css/feather.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./customStyle.scss";
import "../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "../node_modules/sweetalert2/dist/sweetalert2.min.css";
import "./assets/css/sweetalert.css";

import RouteLoader from "./components/loader/RouteLoader";
import { Provider } from "react-redux";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <AuthProvider>
                    <RouteLoader />
                    <App />
                </AuthProvider>
            </Provider>
        </BrowserRouter>
    </StrictMode>,
);
