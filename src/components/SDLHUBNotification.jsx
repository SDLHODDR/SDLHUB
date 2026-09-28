import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotifications,
  markNotificationRead,
} from "../store/notifications/notificationSlice";
import { formatDate } from "../utils/formatUtils";

const SDLHUBNotification = () => {
  const dispatch = useDispatch();
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const { items, unreadCount, status, error, markingReadIds } = useSelector(
    (state) => state.notifications,
  );

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const unreadItems = useMemo(
    () => items.filter((item) => !(item.VIEWED_ON ?? item.viewed_on)),
    [items],
  );
  const archivedItems = useMemo(
    () => items.filter((item) => Boolean(item.VIEWED_ON ?? item.viewed_on)),
    [items],
  );
  const visibleItems = activeTab === "unread" ? unreadItems : archivedItems;

  const handleOpenNotification = (item) => {
    const id = item.ID ?? item.id;
    if (activeTab === "unread" && id != null) {
      dispatch(markNotificationRead(id));
    }
  };

  const handleRetry = () => dispatch(getNotifications());

  return (
    <div className="sdlhub-notification" ref={wrapperRef}>
      <button
        type="button"
        className="sdlhub-notification__trigger"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
      >
        <i className="ti ti-bell fs-22" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="sdlhub-notification__count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          className="sdlhub-notification__panel notifications"
          role="dialog"
          aria-label="Notifications"
        >
          <header className="sdlhub-notification__header">
            <h2 className="notification-title">Notifications</h2>
            <button
              type="button"
              className="sdlhub-notification__close"
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </header>

          <div className="sdlhub-notification__tabs" role="tablist" aria-label="Notification status">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "unread"}
              className={activeTab === "unread" ? "is-active" : ""}
              onClick={() => setActiveTab("unread")}
            >
              Unread <span>{unreadItems.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "archived"}
              className={activeTab === "archived" ? "is-active" : ""}
              onClick={() => setActiveTab("archived")}
            >
              Archived <span>{archivedItems.length}</span>
            </button>
          </div>

          <div className="sdlhub-notification__content" role="tabpanel">
            {error && items.length > 0 && (
              <p className="sdlhub-notification__error" role="alert">{error}</p>
            )}
            {status === "loading" && items.length === 0 ? (
              <p className="sdlhub-notification__state">Loading notifications...</p>
            ) : error && items.length === 0 ? (
              <div className="sdlhub-notification__state" role="alert">
                <p>{error}</p>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleRetry}>
                  Retry
                </button>
              </div>
            ) : visibleItems.length === 0 ? (
              <p className="sdlhub-notification__state">
                {activeTab === "unread" ? "You're all caught up." : "No archived notifications."}
              </p>
            ) : (
              <ul className="notification-list">
                {visibleItems.map((item, index) => {
                  const id = item.ID ?? item.id ?? `${item.EMP_CODE}-${item.ASON_DATE}-${index}`;
                  const isMarkingRead = markingReadIds.includes(String(id));
                  return (
                    <li className="notification-message" key={id}>
                      <button
                        type="button"
                        className={`sdlhub-notification__item ${activeTab === "unread" ? "is-unread" : ""}`}
                        disabled={isMarkingRead}
                        onClick={() => handleOpenNotification(item)}
                      >
                        <span className="sdlhub-notification__type" aria-hidden="true">
                          <i className="ti ti-bell" />
                        </span>
                        <span className="sdlhub-notification__message">
                          <span className="sdlhub-notification__description">{item.DESCR ?? item.descr}</span>
                          <span className="sdlhub-notification__meta">
                            {item.ATTN_TYPE ?? item.attn_type ?? "Notification"}
                            {(item.ASON_DATE ?? item.ason_date) && ` · ${formatDate(item.ASON_DATE ?? item.ason_date)}`}
                          </span>
                        </span>
                        {isMarkingRead && <span className="sdlhub-notification__spinner" aria-label="Archiving" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default SDLHUBNotification;