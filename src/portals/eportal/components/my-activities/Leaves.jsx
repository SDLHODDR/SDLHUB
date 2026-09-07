import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getLeavesDataResponse } from "../../../../store/eportal/ePortalLeavesSlice";
import { getAuthroizationTaskCount } from "../../../../store/eportal/ePortalAuthorizationCountSlice";

import { createLeavesHandlers } from "../../utils/LeavesHandlers";

import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";

import LeavesModal from "../../modal/LeavesModal";
import { leavesColumns } from "../../utils/columnHandlers/leavesColumns";

import { notifyError } from "../../../../services/alertService";

import { getLRDataDetails } from "../../services/leavesService";

import { getPortalFromPath } from "../../../../config/portalConfig";

const Leaves = () => {
  const dispatch = useDispatch();

  /* ============================================================
     REDUX DATA
  ============================================================ */

  const leavesData = useSelector((state) => state.eportalLRData.data);

  const loading = useSelector((state) => state.eportalLRData.loading);

  /* ============================================================
     LOCAL STATE
  ============================================================ */

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [refreshKey, setRefreshKey] = useState(0);

  const [modalLoading, setModalLoading] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    modalDate: null,
    id: null,
    isPostRemark: null,
  });

  /* ============================================================
     PORTAL
  ============================================================ */

  const portal = getPortalFromPath(location.pathname);

  const portalHome = `/${portal.key}/dashboard`;

  /* ============================================================
     FETCH LEAVE DATA
  ============================================================ */

  useEffect(() => {
    dispatch(getLeavesDataResponse());
  }, [dispatch, refreshKey]);

  /* ============================================================
     NORMALIZE API DATA
  ============================================================ */

  const listData = useMemo(() => {
    try {
      const data = leavesData?.data || [];

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item, index) => {
        const rawStatus = String(item?.status ?? "")
          .trim()
          .toUpperCase();

        const displayStatus = String(item?.STATUS ?? "").trim();

        return {
          ID: item?.ID ?? index,

          LVE_DATE_FR: item?.LVE_DATE_FR || "-",

          LVE_DATE_TO: item?.LVE_DATE_TO || "-",

          LVE_CODE: item?.LVE_CODE || "-",

          NO_DAYS: item?.NO_DAYS || "-",

          REMARKS: item?.REMARKS || "-",

          /*
           * Raw database status
           *
           * A = Approved
           * N = Pending from Admin
           * R = Rejected
           * T = In Process
           */
          status: rawStatus || "-",

          /*
           * Human-readable status
           */
          statusText: displayStatus || "-",

          STATUS: displayStatus || "-",

          statusColor: item?.statusColor || "secondary",
        };
      });
    } catch (error) {
      console.error("Error preparing leave data:", error);

      return [];
    }
  }, [leavesData]);

  /* ============================================================
     STATUS OPTIONS
  ============================================================ */

  const statusOptions = useMemo(() => {
    return [
      {
        value: "ALL",
        label: "All Status",
      },

      {
        value: "A",
        label: "Approved",
      },

      {
        value: "N",
        label: "Pending from Admin",
      },

      {
        value: "R",
        label: "Rejected",
      },

      {
        value: "T",
        label: "In Process",
      }
    ];
  }, []);

  /* ============================================================
     SEARCH + STATUS FILTER
  ============================================================ */

  const filteredData = useMemo(() => {
    let data = [...listData];

    /* ----------------------------------------------------------
       STATUS FILTER
    ---------------------------------------------------------- */

    if (statusFilter && statusFilter !== "ALL") {
      data = data.filter((item) => {
        return (
          String(item?.status ?? "")
            .trim()
            .toUpperCase() === String(statusFilter).trim().toUpperCase()
        );
      });
    }

    /* ----------------------------------------------------------
       SEARCH FILTER
    ---------------------------------------------------------- */

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return data;
    }

    return data.filter((item) => {
      const leaveCode = String(item?.LVE_CODE ?? "").toLowerCase();

      const remarks = String(item?.REMARKS ?? "").toLowerCase();

      const status = String(item?.statusText ?? "").toLowerCase();

      const fromDate = String(item?.LVE_DATE_FR ?? "").toLowerCase();

      const toDate = String(item?.LVE_DATE_TO ?? "").toLowerCase();

      return (
        leaveCode.includes(query) ||
        remarks.includes(query) ||
        status.includes(query) ||
        fromDate.includes(query) ||
        toDate.includes(query)
      );
    });
  }, [listData, searchQuery, statusFilter]);

  /* ============================================================
     OPEN MODAL
  ============================================================ */

  const openModal = (config = {}) => {
    setModalLoading(true);

    const formatLocalDateTime = (date) => {
      if (!date) {
        return null;
      }

      const localDate = date instanceof Date ? date : new Date(date);

      if (Number.isNaN(localDate.getTime())) {
        return null;
      }

      const pad = (n) => String(n).padStart(2, "0");

      const year = localDate.getFullYear();

      const month = pad(localDate.getMonth() + 1);

      const day = pad(localDate.getDate());

      const hours = pad(localDate.getHours());

      const minutes = pad(localDate.getMinutes());

      const seconds = pad(localDate.getSeconds());

      return `${year}-${month}-${day} ` + `${hours}:${minutes}:${seconds}`;
    };

    const fetchLRData = async () => {
      try {
        setModalLoading(true);

        const modalDate = config?.modalDate || null;

        const response = await getLRDataDetails({
          id: modalDate,

          ID: modalDate,

          getLrdata: false,

          checkModalDate: true,

          ro: undefined,

          modal_date: formatLocalDateTime(modalDate),
        });

        console.log("Leave modal validation response:", response);

        const flag = response?.data?.pass?.flag;

        if (flag === "Yes") {
          setModalState({
            isOpen: true,

            mode: config?.mode || "create",

            modalDate: modalDate,

            id: config?.id || null,

            isPostRemark: config?.isPostRemark || null,
          });
        } else if (flag === "No") {
          notifyError("You have already applied leave!");

          setModalState({
            isOpen: false,

            mode: config?.mode || "create",

            modalDate: modalDate,

            id: config?.id || null,

            isPostRemark: config?.isPostRemark || null,
          });
        } else {
          /*
           * If API doesn't return the expected flag,
           * don't silently open the modal.
           */
          notifyError("Unable to verify leave date.");

          setModalState((prev) => ({
            ...prev,
            isOpen: false,
          }));
        }
      } catch (error) {
        console.error("Error fetching Leave Request Data:", error);

        notifyError("Unable to verify leave date.");
      } finally {
        setModalLoading(false);
      }
    };

    fetchLRData();
  };

  /* ============================================================
     FORM SETTINGS
  ============================================================ */

  const formSettings = {
    isOpen: false,

    modalPage: "Leave",

    mode: "create",

    modeLabel: "Add",

    modalDate: null,

    form_header: "Leaves",

    form_text: "Manage Your leaves",

    showHeader: true,

    showLayout: true,
  };

  /* ============================================================
     CLOSE MODAL
  ============================================================ */

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));

    setModalLoading(false);
  };

  /* ============================================================
     SUCCESS AFTER SAVE
  ============================================================ */

  const handleSuccess = () => {
    /*
     * Refresh leave list
     */
    dispatch(getLeavesDataResponse());

    /*
     * Refresh table
     */
    setRefreshKey((prev) => prev + 1);

    /*
     * Refresh authorization count
     */
    dispatch(getAuthroizationTaskCount());
  };

  /* ============================================================
     HANDLERS
  ============================================================ */

  const handlers = createLeavesHandlers({
    handleSuccess,
    openModal,
  });

  const columns = leavesColumns(handlers);

  /* ============================================================
     CLEAR FILTERS
  ============================================================ */

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  /* ============================================================
     JSX
  ============================================================ */

  return (
    <>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Leaves Request</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },

            {
              text: "Leaves Request",
            },
          ]}
        />
      </div>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="card">
        <div className="card-body">
          <div className="row">
            {/* ==================================================
                LEFT CALENDAR
            ================================================== */}

            <div className="col-xl-3 border-end leaves-calendar-column">
                <SDLCalendar
                    mode="inline"
                    openModal={openModal}
                />
            </div>

            {/* ==================================================
                RIGHT TABLE
            ================================================== */}

            <div className="col-xl-9 d-flex flex-column">
              <h6 className="mb-3">Leave Request Preview</h6>

              <div className="position-relative flex-grow-1">
                {/* =================================================
                    SEARCH + STATUS FILTER
                ================================================= */}

                <div className="row mb-3 align-items-center g-2">
                  {/* SEARCH */}

                  <div className="col-lg-5 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search Leaves..."
                      style={{
                        width: "100%",
                      }}
                    />
                  </div>

                  {/* STATUS */}

                  <div className="col-lg-3 col-md-4 col-12">
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CLEAR */}

                  <div className="col-lg-2 col-md-2 col-12">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={statusFilter === "ALL"}
                      onClick={clearFilters}
                    >
                      <i className="ti ti-refresh me-1"></i>
                      Reset
                    </button>
                  </div>

                  {/* RESULT COUNT */}

                  <div className="col-lg-2 col-md-12 col-12 text-lg-end">
                    {/*<small className="text-muted">

                      Showing{" "}

                      <strong>
                        {
                          filteredData.length
                        }
                      </strong>

                      {" "}of{" "}

                      <strong>
                        {
                          listData.length
                        }
                      </strong>

                    </small> */}
                  </div>
                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  loading={loading}
                  emptyMessage={
                    searchQuery || statusFilter !== "ALL"
                      ? "No leave requests match the selected filter"
                      : "No leave requests found"
                  }
                  removableSort
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          LEAVE MODAL
      ====================================================== */}

      {modalState.isOpen && (
        <LeavesModal
          formSettings={formSettings}
          modalState={modalState}
          closeModal={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default Leaves;
