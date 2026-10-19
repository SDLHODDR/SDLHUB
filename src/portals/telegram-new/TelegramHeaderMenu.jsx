import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTelegramCounts } from "../../store/telegram/telegramCountSlice";

const TelegramHeaderMenu = ({ mobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const dispatch = useDispatch();
  const { groupCount, memberCount, pendingMessageCount, loading, status } =
    useSelector((state) => state.telegramCounts);
  const totalCount = groupCount + memberCount + pendingMessageCount;

  const toggleMenu = () => {
    const shouldOpen = !isOpen;
    if (shouldOpen) dispatch(fetchTelegramCounts());
    setIsOpen(shouldOpen);
  };

  const formatCount = (count) => {
    if (loading && status !== "succeeded") return "...";
    if (status === "failed") return "-";
    return count.toLocaleString();
  };

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
        onClick={toggleMenu}
      >
        <i className="ti ti-brand-telegram fs-22" aria-hidden="true" />
        {totalCount > 0 && (
          <span className="telegram-header-menu__badge" aria-label={`${totalCount} Telegram items`}>
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>
      {isOpen && (
        <section className="telegram-header-menu__panel" role="menu" aria-label="Telegram Notifications">
          <h2>Telegram Counts</h2>
          <Link role="menuitem" to="/telegram-new/groups" onClick={() => setIsOpen(false)}>Groups <span>{formatCount(groupCount)}</span></Link>
          <Link role="menuitem" to="/telegram-new/members" onClick={() => setIsOpen(false)}>Members <span>{formatCount(memberCount)}</span></Link>
          <Link role="menuitem" to="/telegram-new/messages" onClick={() => setIsOpen(false)}>Pending messages <span>{formatCount(pendingMessageCount)}</span></Link>
          <Link className="telegram-header-menu__dashboard" role="menuitem" to="/telegram-new/" onClick={() => setIsOpen(false)}>Open Telegram dashboard</Link>
        </section>
      )}
    </div>
  );
};

export default TelegramHeaderMenu;