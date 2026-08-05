import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOutdoorDutyDataResponse } from "../../../../store/eportal/ePortalOutdoorDutySlice";
import { createOutdoorDutyHandlers } from "../../utils/outdoorDutyHandlers"; // adjust path
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
  //const [listData, setListData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const outdoorDutydata = useSelector((state) => state.eportalODData.data);
  const odLoading = useSelector((state) => state.eportalODData.loading); // if your slice tracks this
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Get current portal dynamically
	const portal = getPortalFromPath(location.pathname);
	const portalHome = `/${portal.key}/dashboard`;

  useEffect(() => {
    dispatch(getOutdoorDutyDataResponse());
  }, [dispatch, refreshKey]);

  //console.log("=====================OD Data SLice odLoading================", odLoading);

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
        authremarks: item.authremarks || "_"
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [outdoorDutydata]);
  //console.log("=====", outdoorDutydata);


  /* ================= SEARCH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();

    return listData.filter(
      (item) =>
        item.outType.toLowerCase().includes(query) ||
        item.remarks.toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    modalDate: null,
  });

  const openModal = (config = {}) => {
    setModalLoading(true);
    //console.log("=======config========", config);
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      // Remove time portion for accurate day comparison
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

    //console.log("========== config postRemarks ================", config);
    setModalState({
      isOpen: true,
      mode: config.mode || "create",
      modalDate: config.modalDate || null,
      id: config.id || null,
      isPostRemark: config.isPostRemark || null,
      //modalData: config.data || null
    });

    //console.log("=======modalState========", modalState);
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
    // console.log(
    //   "----------------OutdoorDuty.jsx: handleSuccess called----------------",
    // );
    dispatch(getOutdoorDutyDataResponse());
    // refresh GenericDataTable (Add/Edit/Delete flow)
    setRefreshKey((prev) => prev + 1);
    // refresh Authorization table (if passed)
    dispatch(getAuthroizationTaskCount());
  };

  const handlers = createOutdoorDutyHandlers({
    handleSuccess,
    openModal,
  });
  const columns = outdoorDutyColumns(handlers);

  //console.log("==============ListData===========", listData);
  //console.log("==============Data===========", filteredData);

  return (
    <>
      {/* ================= PAGE HEADER ================= */}

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

      {/* ================= MAIN CARD ================= */}
      {odLoading || modalLoading && (
        <div className="p-4 text-center">
          <div className="spinner-border text-warning"></div>
        </div>
      )}
      <div className="card">
        <div className="card-body">
          <div className="row">
            {/* ================= LEFT SIDE OUTDOOR DUTY LIST ================= */}
            <div className="col-xl-3 border-end">
              <SDLCalendar openModal={openModal} />
            </div>
            {/* ================= RIGHT SIDE PDF PREVIEW ================= */}
            <div className="col-xl-9 d-flex flex-column">
              <h6 className="mb-3">Outdoor Duty Preview</h6>
              <div className="position-relative flex-grow-1">
                {/* ================= SEARCH ================= */}

                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search Outdoor Duties..."
                      style={{ width: "120px" }}
                    />
                  </div>
                </div>
                {/* {loading ? (
                  <div className="p-4 text-center">
                    <div className="spinner-border text-warning"></div>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No requests found
                  </div>
                ) : ( */}
                  <SDLDataTable
                    data={filteredData}
                    columns={columns}
                    loading={odLoading}
                    emptyMessage="No outdoor duties found"
                    removableSort
                  />
                {/*  )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================= MODAL ================= */}
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
