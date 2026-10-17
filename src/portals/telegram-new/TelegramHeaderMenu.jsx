import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const TelegramHeaderMenu = ({ mobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleDismiss = (event) => {
      if (event.key === "Escape" || !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDismiss);
    document.addEventListener("keydown", handleDismiss);
    return () => {
      document.removeEventListener("mousedown", handleDismiss);
      document.removeEventListener("keydown", handleDismiss);
    };
  }, [isOpen]);

  return (
    <div className={`telegram-header-menu ${mobile ? "is-mobile" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="nav-link"
        aria-label="Telegram"
        title="Telegram"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <i className="ti ti-brand-telegram fs-22" aria-hidden="true" />
      </button>
      {isOpen && (
        <section className="telegram-header-menu__panel" role="menu" aria-label="Telegram Notifications">
          <h2>Telegram Notifications</h2>
          <p>Unread category counts are not exposed by the current backend.</p>
          <Link role="menuitem" to="/telegram-new/groups" onClick={() => setIsOpen(false)}>New Group <span>N/A</span></Link>
          <Link role="menuitem" to="/telegram-new/members" onClick={() => setIsOpen(false)}>New Member <span>N/A</span></Link>
          <Link role="menuitem" to="/telegram-new/messages" onClick={() => setIsOpen(false)}>New Message <span>N/A</span></Link>
          <Link className="telegram-header-menu__dashboard" role="menuitem" to="/telegram-new/" onClick={() => setIsOpen(false)}>Open Telegram dashboard</Link>
        </section>
      )}
    </div>
  );
};

export default TelegramHeaderMenu;