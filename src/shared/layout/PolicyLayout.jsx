import { Outlet } from "react-router-dom";

import HeaderTop from "./HeaderTop";
import Footer from "./Footer";

const PolicyLayout = () => {
    return (
        <div className="main-wrapper">
            <HeaderTop />

            <div className="page-wrapper">
                <div className="content">
                    <Outlet />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PolicyLayout;