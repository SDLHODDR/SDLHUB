import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  getNotifications,
  markNotificationRead,
} from "../store/notifications/notificationSlice";
import { getPortalFromPath } from "../config/portalConfig";
import { formatDate } from "../utils/formatUtils";

const SDLHUBNotification = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const activePortal = getPortalFromPath(location.pathname).key;
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const { items, unreadCount, status, error, markingReadIds } = useSelector(
    (state) => state.notifications,
  );

  useEffect(() => {
    dispatch(getNotifications(activePortal));
  }, [activePortal, dispatch]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        if (selectedNotification) {
          setSelectedNotification(null);
        } else {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, selectedNotification]);

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
    setSelectedNotification(item);
    setSelectedPortal(activePortal);
  };

  const handleMarkSelectedRead = async () => {
    const id = selectedNotification?.ID ?? selectedNotification?.id;
    if (id == null) return;

    const result = await dispatch(markNotificationRead({ id, portal: activePortal }));
    if (markNotificationRead.fulfilled.match(result)) {
      setSelectedNotification(null);
    }
  };

  const handleRetry = () => dispatch(getNotifications(activePortal));

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
                {activeTab === "unread" ? "No unread notifications found" : "No archived notifications found."}
              </p>
            ) : (
              <ul className="notification-list">
                {visibleItems.map((item, index) => {
                  const id = item.ID ?? item.id ?? `${item.EMP_CODE}-${item.ASON_DATE}-${index}`;
                  const isMarkingRead = markingReadIds.includes(`${activePortal}:${id}`);
                  const notificationDate = activeTab === "unread"
                    ? item.ASON_DATE_date ?? item.ASON_DATE ?? item.ason_date
                    : item.VIEWED_ON ?? item.viewed_on;
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
                            {/* {item.ATTN_TYPE ?? item.attn_type ?? "Notification"} */}
                            {activeTab === "unread" ? "Published on : " : "Viewed on : "}
                            {notificationDate && formatDate(notificationDate)}
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

      {isOpen && selectedNotification && selectedPortal === activePortal && (() => {
        const isSelectedUnread = !(selectedNotification.VIEWED_ON ?? selectedNotification.viewed_on);
        const selectedId = selectedNotification.ID ?? selectedNotification.id;
        const selectedReadKey = `${activePortal}:${selectedId}`;
        const isMarkingSelectedRead = markingReadIds.includes(selectedReadKey);
        const selectedDate = isSelectedUnread
          ? selectedNotification.ASON_DATE_date ?? selectedNotification.ASON_DATE ?? selectedNotification.ason_date
          : selectedNotification.VIEWED_ON ?? selectedNotification.viewed_on;

        return (
          <div
            className="sdlhub-notification__modal-backdrop"
            onClick={() => setSelectedNotification(null)}
          >
            <section
              className="sdlhub-notification__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sdlhub-notification-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="sdlhub-notification__modal-header">
                <h2 id="sdlhub-notification-modal-title">Notification 
                ({selectedDate && formatDate(selectedDate)})
                </h2>
                <button
                  type="button"
                  className="sdlhub-notification__close"
                  aria-label="Close notification"
                  onClick={() => setSelectedNotification(null)}
                >
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </header>
              {/* <div className="sdlhub-notification__modal-meta"> */}
                {/* {selectedNotification.ATTN_TYPE ?? selectedNotification.attn_type ?? "Notification"} */}
                {/* {isSelectedUnread ? "Published on : " : "Viewed on : "}
                {selectedDate && formatDate(selectedDate)} */}
              {/* </div> */}
              <div className="sdlhub-notification__modal-message">
                {selectedNotification.DESCR ?? selectedNotification.descr}
              </div>
              <footer className="sdlhub-notification__modal-actions">
                {isSelectedUnread && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isMarkingSelectedRead}
                    onClick={handleMarkSelectedRead}
                  >
                    {isMarkingSelectedRead ? "Marking as read..." : "Mark as Read"}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedNotification(null)}
                >
                  Cancel
                </button>
              </footer>
            </section>
          </div>
        );
      })()}
    </div>
  );
};

export default SDLHUBNotification;