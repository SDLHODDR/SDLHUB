import { useEffect, useState } from "react";
import { getBirthdayWishes } from "../../services/dashboardService";
import { STOREIMAGES } from "../../../../shared/assets/assets";

const DEFAULT_AVATAR = STOREIMAGES.PROFILE.AVATAR_1;

/**
 * Header cake icon + "You have received birthday wishes" popup
 * (old ePortal: myspace/inc/ui.php). Shown only when this year's wishes exist.
 */
const ReceivedWishes = () => {
  const [wishes, setWishes] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getBirthdayWishes()
      .then((res) => {
        if (alive && res?.status) setWishes(res.data?.wishes || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (wishes.length === 0) return null;

  return (
    <>
      <a
        href="#"
        role="button"
        className="nav-link btn btn-link p-0 position-relative me-3"
        title="Birthday wishes"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <i className="ti ti-cake fs-22" />
        <span
          className="badge rounded-pill bg-danger position-absolute"
          style={{
            top: "-10px",
            right: "-12px",
            fontSize: "10px",
            minWidth: "18px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          {wishes.length}
        </span>
      </a>

      {open && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    🎉 You have received birthday wishes from your colleagues! 🎂
                  </h5>
                  <button
                    type="button"
                    className="btn-close custom-btn-close p-0"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>

                <div className="modal-body">
                  {wishes.map((w, i) => (
                    <div
                      key={`${w.from_code}-${i}`}
                      className={`d-flex gap-3 py-3 ${i < wishes.length - 1 ? "border-bottom" : ""}`}
                    >
                      <img
                        src={w.profile_image || DEFAULT_AVATAR}
                        alt={w.from_name}
                        width={48}
                        height={48}
                        className="rounded-circle flex-shrink-0"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_AVATAR) {
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }
                        }}
                      />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between gap-2 flex-wrap">
                          <span className="fw-semibold">{w.from_name}</span>
                          <small className="text-muted">{w.sent_on}</small>
                        </div>
                        <p className="mb-0 mt-1" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {w.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
};

export default ReceivedWishes;
