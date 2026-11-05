import { Link } from "react-router-dom";

const BreadcrumbNav = ({ items }) => {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li
                            key={index}
                            className={`breadcrumb-item ${isLast ? "active" : ""}`}
                            aria-current={isLast ? "page" : undefined}
                        >
                            {isLast || !item.link ? (
                                item.text
                            ) : (
                                <Link to={item.link}>{item.text}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadcrumbNav;