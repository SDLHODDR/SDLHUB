import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOutdoorDutyDataResponse } from "../../../../store/eportal/ePortalOutdoorDutySlice";
import { createOutdoorDutyHandlers } from "../../utils/outdoorDutyHandlers";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";
import OutdoorDutyModal from "../../modal/OutdoorDutyModal";
import { outdoorDutyColumns } from "../../utils/columnHandlers/outdoorDutyColumns";
import { notifyWarning } from "../../../../services/alertService";
import { getAuthroizationTaskCount } from "../../../../store/eportal/ePortalAuthorizationCountSlice";
import { getPortalFromPath } from "../../../../config/portalConfig";

const OutdoorDuty = () => {
  const dispatch = useDispatch();
  const [modalLoading, setModalLoading] = useState(false);
  const outdoorDutydata = useSelector((state) => state.eportalODData.data);
  const odLoading = useSelector((state) => state.eportalODData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshKey, setRefreshKey] = useState(0);

  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  useEffect(() => {
    dispatch(getOutdoorDutyDataResponse());
  }, [dispatch, refreshKey]);

  const listData = useMemo(() => {
    try {
      return (outdoorDutydata || []).map((item, index) => ({
        id: item.id || index,
        asonDate: item.asondate || "-",
        outType: item.outtype || "-",
        createdOn: item.created_on || "-",
        statusText: item.approval || "-",
        remarks: item.remarks || "-",
        statusColor: item.statusColor || "-",
        status: item.status || "-",
        dateTimePass: item.dateTimePass || "_",
        postremarks: item.postremarks,
        authremarks: item.authremarks || "_",
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [outdoorDutydata]);

  /* ============================================================
     STATUS OPTIONS — derived dynamically from actual data so we
     never hardcode codes we haven't verified against the API.
     Falls back to a normal placeholder list once data is loaded.
  ============================================================ */
  const statusOptions = useMemo(() => {
    const seen = new Map();

    listData.forEach((item) => {
      if (item.status && item.status !== "-" && !seen.has(item.status)) {
        seen.set(item.status, item.statusText || item.status);
      }
    });

    return [
      { value: "ALL", label: "All Status" },
      ...Array.from(seen.entries()).map(([value, label]) => ({
        value,
        label,
      })),
    ];
  }, [listData]);

  /* ================= FILTERS (status + search, independent) ================= */
  const filteredData = useMemo(() => {
    let data = [...listData];

    if (statusFilter && statusFilter !== "ALL") {
      data = data.filter(
        (item) =>
          String(item?.status ?? "").trim().toUpperCase() ===
          String(statusFilter).trim().toUpperCase(),
      );
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data;
    }

    return data.filter(
      (item) =>
        item.outType.toLowerCase().includes(query) ||
        item.remarks.toLowerCase().includes(query),
    );
  }, [searchQuery, statusFilter, listData]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    modalDate: null,
  });

  const openModal = (config = {}) => {
    setModalLoading(true);
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(currentDate - modalDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > 25) {
        setModalLoading(false);
        notifyWarning("It is not permitted to raise an Outdoor Duty request", "Not Permitted");
        return;
      }
    }

    setModalState({
      isOpen: true,
      mode: config.mode || "create",
      modalDate: config.modalDate || null,
      id: config.id || null,
      isPostRemark: config.isPostRemark || null,
    });

    setModalLoading(false);
  };

  const formSettings = {
    isOpen: false,
    modalPage: "Outdoor",
    mode: "create",
    modeLabel: "Add",
    modalDate: null,
    form_header: "Outdoor Duty",
    form_text: "Manage Your outdoor duty",
    showHeader: true,
    showLayout: true,
  };

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setModalLoading(false);
  };

  const handleSuccess = () => {
    dispatch(getOutdoorDutyDataResponse());
    setRefreshKey((prev) => prev + 1);
    dispatch(getAuthroizationTaskCount());
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const handlers = createOutdoorDutyHandlers({
    handleSuccess,
    openModal,
  });
  const columns = outdoorDutyColumns(handlers);

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Outdoor Duties</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Outdoor Duties" },
          ]}
        />
      </div>

      {(odLoading || modalLoading) && (
        <div className="p-4 text-center">
          <div className="spinner-border text-warning"></div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-xl-3 border-end">
              <SDLCalendar mode="inline" openModal={openModal} />
            </div>

            <div className="col-xl-9 d-flex flex-column">
              <h6 className="mb-3">Outdoor Duty Preview</h6>
              <div className="position-relative flex-grow-1">
                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search Outdoor Duties..."
                      style={{ width: "270px" }}
                    />
                  </div>

                  {/* STATUS */}
                  <div className="col-lg-3 col-md-4 col-12">
                    <select
                      className="form-select sdl-dark-select"
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
                      disabled={statusFilter === "ALL" && !searchQuery}
                      onClick={clearFilters}
                    >
                      <i className="ti ti-refresh me-1"></i>
                      Reset
                    </button>
                  </div>
                </div>

                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  loading={odLoading}
                  emptyMessage={
                    searchQuery || statusFilter !== "ALL"
                      ? "No outdoor duty requests match the selected filter"
                      : "No outdoor duties found"
                  }
                  removableSort
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalState.isOpen && (
        <OutdoorDutyModal
          formSettings={formSettings}
          modalState={modalState}
          closeModal={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default OutdoorDuty;