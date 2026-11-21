import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMenu } from "../../services/menuService";
import { LOGOS } from "../../../../shared/assets/assets";
import { notifyError } from "../../../../shared/services/alertService";
import { setPortalMenuTrail } from "../../../../shared/components/breadcrumbMenuStore";

const formatRoute = (route) => {
	if (!route) return "/";
	return "/" + route.replace(".php", "").replaceAll("_", "-");
};

/*
 * EPT_MENU.MENU_ICON holds old Line Awesome names (not loaded in SDL Hub) or nothing, and the
 * table is shared with the old ePortal, so the icons are set here in the Font Awesome style HRMS uses.
 */
const MENU_ICONS = {
	"dashboard": "fas fa-tachometer-alt",
	"my activities": "fas fa-tasks",
	"policies & documents": "fas fa-folder-open",
	"maintenance": "fas fa-cog",
	"reports": "fas fa-bolt",
};

const menuIconClass = (menu) =>
	MENU_ICONS[String(menu.label || "").trim().toLowerCase()] ||
	(/\bfa[srb]?\b/.test(menu.icon || "") ? menu.icon : "ti ti-layout-grid fs-16");

const HorizontalMenu = () => {
	const location = useLocation();

	const [menus, setMenus] = useState([]);
	const [openMenu, setOpenMenu] = useState(null);

	useEffect(() => {
		const loadMenus = async () => {
			try {
			const res = await getMenu();

			if (res?.status) {
				setMenus(res.data || []);
			} else {
				notifyError(res?.message || "Unable to load menus.");
			}
			} catch (err) {
			notifyError(err.message || "Unable to load menus.");
			}
		};
		loadMenus();
	}, []);

	// Lets BreadcrumbNav show Home / Main menu / Sub menu for the open page.
	useEffect(() => {
		setPortalMenuTrail(
			"eportal",
			menus.flatMap((menu) =>
				(menu.children || []).map((child) => ({
					path: formatRoute(child.route),
					main: menu.label,
					sub: child.label,
				}))
			)
		);
	}, [menus]);

	const isChildActive = (route) => {
		const formattedRoute = formatRoute(route);

		return (
			location.pathname === formattedRoute ||
			location.pathname.startsWith(formattedRoute + "/")
		);
	};

	const isMenuActive = (menu) => {
		return menu.children?.some((child) =>
			isChildActive(child.route)
		);
	};

	const toggleMenu = (menuId) => {
		setOpenMenu((prev) =>
			prev === menuId ? null : menuId
		);
	};

	const renderMenuItems = (mobile = false) => {
		return menus.map((menu) => {
			const isOpen =
				openMenu === menu.id ||
				isMenuActive(menu);

			return (
				<li
					key={menu.id}
					className={`submenu ${
						isOpen ? "submenu-open" : ""
					}`}
				>
					<a
						href="#"
						className={
							isOpen ? "subdrop" : ""
						}
						onClick={(e) => {
							e.preventDefault();

							if (mobile) {
								toggleMenu(menu.id);
							}
						}}
					>
						<i className={`${menuIconClass(menu)} me-2`}></i>

						<span>{menu.label}</span>

						{menu.children?.length > 0 && (
							<span className="menu-arrow"></span>
						)}
					</a>

					{menu.children?.length > 0 && (
						<ul
							style={
								mobile
									? {
											display: isOpen
												? "block"
												: "none",
									  }
									: {}
							}
						>
							{menu.children.map((child) => (
								<li
									key={child.id}
									className={
										isChildActive(
											child.route
										)
											? "active"
											: ""
									}
								>
									<Link
										to={formatRoute(
											child.route
										)}
									>
										<span>
											{child.label}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</li>
			);
		});
	};

	return (
		<>
			{/* MOBILE SIDEBAR */}
			<div className="sidebar" id="sidebar">
				<div className="sidebar-logo active">
					<Link
						to="/"
						className="logo logo-normal"
					>
						<img
							src={LOGOS.MOBILE_LOGO}
							alt="Logo"
						/>
					</Link>
				</div>

				<div className="sidebar-inner slimscroll">
					<div
						id="sidebar-menu"
						className="sidebar-menu"
					>
						<ul>
							{renderMenuItems(true)}
						</ul>
					</div>
				</div>
			</div>

			{/* DESKTOP HORIZONTAL MENU */}
			<div
				className="sidebar sidebar-horizontal"
				id="horizontal-menu"
			>
				<div
					id="sidebar-menu-3"
					className="sidebar-menu"
				>
					<div className="main-menu">
						<ul className="nav-menu">
							{renderMenuItems(false)}
						</ul>
					</div>
				</div>
			</div>

			{/* OVERLAY */}
			<div
				className="sidebar-overlay"
				onClick={() => {
					document
						.querySelector(
							".main-wrapper"
						)
						?.classList.remove(
							"slide-nav"
						);

					document
						.querySelector(
							".sidebar-overlay"
						)
						?.classList.remove(
							"opened"
						);

					document.documentElement.classList.remove(
						"menu-opened"
					);
				}}
			/>
		</>
	);
};

export default HorizontalMenu;
