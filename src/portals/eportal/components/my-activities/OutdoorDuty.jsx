import { useEffect, useState, useMemo } from "react";
import { ActivityPageLayout, ActivitySectionHead, ActivityFilterBar } from "./common/ActivityLayout";
import { useDispatch, useSelector } from "react-redux";
import { getOutdoorDutyDataResponse } from "../../store/ePortalOutdoorDutySlice";
import { createOutdoorDutyHandlers } from "../../utils/outdoorDutyHandlers";
import BreadcrumbNav from "../../../../shared/components/BreadcrumbNav";
import SDLDataTable from "../../../../shared/components/datatable/SDLDataTable";
import SDLCalendar from "../../../../shared/components/calendar/SDLCalendar";
import OutdoorDutyModal from "../../modal/OutdoorDutyModal";
import { outdoorDutyColumns } from "../../utils/columnHandlers/outdoorDutyColumns";
import { notifyWarning } from "../../../../shared/services/alertService";
import { getAuthroizationTaskCount } from "../../store/ePortalAuthorizationCountSlice";
import { getPortalFromPath } from "../../../../shared/config/portalConfig";
import EportalPageLoader from "../loader/EportalPageLoader";
import "../../assets/css/wideContentPages.css";

const OutdoorDuty = () => {
  const dispatch = useDispatch();
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
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(currentDate - modalDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > 25) {
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
    <div className="outdoor-duty-page">
      {odLoading && <EportalPageLoader />}
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

      <ActivityPageLayout
        calendarTitle="Select Duty Date"
        calendarSubtitle="Select a date to create an outdoor duty request"
        calendar={<SDLCalendar mode="inline" openModal={openModal} />}
      >
              <ActivitySectionHead
                title="Outdoor Duty Requests"
                subtitle="View and track your outdoor duty requests"
              />

              <div className="position-relative flex-grow-1">
                <ActivityFilterBar
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search Outdoor Duties..."
                  statusValue={statusFilter}
                  onStatusChange={setStatusFilter}
                  statusOptions={statusOptions}
                  onReset={clearFilters}
                  resetDisabled={statusFilter === "ALL" && !searchQuery}
                />

                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  className="eportal-fit-table"
                  tableStyle={{ width: "100%", minWidth: "100%", tableLayout: "fixed" }}
                  scrollable={false}
                  loading={false}
                  emptyMessage={
                    odLoading
                      ? " "
                      : searchQuery || statusFilter !== "ALL"
                      ? "No outdoor duty requests match the selected filter"
                      : "No outdoor duties found"
                  }
                  removableSort
                />
              </div>
      </ActivityPageLayout>

      {modalState.isOpen && (
        <OutdoorDutyModal
          formSettings={formSettings}
          modalState={modalState}
          closeModal={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default OutdoorDuty;
