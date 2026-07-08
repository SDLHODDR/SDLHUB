import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMenu } from "../../services/menuService";
import { LOGOS } from "../../../../assets/assets";

const HorizontalMenu = () => {
	const location = useLocation();

	const [menus, setMenus] = useState([]);
	const [openMenu, setOpenMenu] = useState(null);

	const formatRoute = (route) => {
		if (!route) return "/";
		return "/" + route.replace(".php", "").replaceAll("_", "-");
	};

	useEffect(() => {
		const loadMenus = async () => {
			try {
			const res = await getMenu();

			console.log("API Response:", res);

			if (res?.status) {
				console.log("Setting menus...");
				setMenus(res.menu || []);
			}
			} catch (err) {
			console.error(err);
			}
		};

		loadMenus();
	}, []);

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
						<i className="ti ti-layout-grid fs-16 me-2"></i>

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
