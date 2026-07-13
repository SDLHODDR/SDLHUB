import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOutdoorDutyDataResponse } from "../../../../store/eportal/ePortalOutdoorDutySlice";
import { 
  sendauthGPDataDetails,
  resendauthGPDataDetails,
  deleteGPData,
  closeGPTicket
} from "../../services/outdoorDutyService";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";
import OutdoorDutyModal from "../../modal/OutdoorDutyModal";
import { outdoorDutyColumns } from "../../utils/columnHandlers/outdoorDutyColumns";
import Swal from "sweetalert2";
import { getAuthroizationTaskCount } from "../../../../store/eportal/ePortalAuthorizationCountSlice";

//const MODULESLICE = "outdoorDuty";

const OutdoorDuty = () => {
  const dispatch = useDispatch();
  const [listData, setListData] = useState([]);
  const [loader, setLoader] = useState(true);
  const outdoorDutydata = useSelector((state) => state.eportalODData.data);
  const loading = useSelector((state) => state.eportalODData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(getOutdoorDutyDataResponse());
  }, [dispatch, refreshKey]);

  console.log("=====", outdoorDutydata);
  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (outdoorDutydata.data || []).map((item, index) => {
        return {
          id: item.id || index,
          asonDate: item.asondate || "-",
          outType: item.outtype || "-",
          statusText: item.approval || "-",
          remarks: item.remarks || "-",
          statusColor: item.statusColor || "-",
          status: item.status || "-",
        };
      });
      if (mounted) setListData(flattened);
    } catch (error) {
      console.error(error);
      if (mounted) setListData([]);
    }
    return () => {
      mounted = false;
    };
  }, [outdoorDutydata]);

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
    setLoader(true);
    console.log("=======config========", config);
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);
      
      // Remove time portion for accurate day comparison
      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(currentDate - modalDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > 25) {
        Swal.fire({
          icon: "warning",
          title: "Not Permitted",
          text: "It is not permitted to raise an Outdoor Duty request",
        });

        return;
      }
    }

    setModalState({
      isOpen: true,
      mode: config.mode || "create",
      modalDate: config.modalDate || null,
      id: config.id || null,
      isPostRemark: config.isPostRemark || null,
      //modalData: config.data || null
    });

    //console.log("=======modalState========", modalState);
    setLoader(false);
  };

  const formSettings = {
    isOpen: false,
    modalPage: "Outdoor",
    mode: "create",
    modeLabel: "Add",
    modalDate: null,
    form_header : "Outdoor Duty",
    form_text : "Manage Your outdoor duty",
    showHeader : true,
    showLayout : true,
  }

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setLoader(false);
  };

  const handleSuccess = () => {
    console.log("----------------OutdoorDuty.jsx: handleSuccess called----------------");
    dispatch(getOutdoorDutyDataResponse());
    // refresh GenericDataTable (Add/Edit/Delete flow)
    setRefreshKey(prev => prev + 1);
    // refresh Authorization table (if passed)
    //dispatch(getAuthroizationTaskCount({
      // user_id:
    //}
    //);
  };

  // =========================
  // COLUMNS (memo)
  // APIs
  // =========================
  const sendAuth = async (id) => {
      const result = await Swal.fire({
        title: "Send for Authorization?",
        icon: "question",
        showCancelButton: true
      });
  
      if (!result.isConfirmed) return;
  
      //try {
        //await sendauthGPDataDetails({ ID: id, sendAuth: true });
        const response = await sendauthGPDataDetails({
          ID: id,
          sendAuth: true
        });

        if (response?.status) {
          await Swal.fire({
            icon: "success",
            title: "Sent!",
            text:
              response?.message ||
              "Authorization request sent successfully."
          });

          //cacheRef.current = {};
          //dispatch(getOutdoorDutyDataResponse());
          handleSuccess?.();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed!",
            text:
              response?.message ||
              "Unable to send authorization request."
          });
        }
      //} 
      // catch {
      //   Swal.fire("Error!", "", "error");
      // }
  };

  const resendAuth = async (id) => {
      const result = await Swal.fire({
        title: "Resend Authorization?",
        icon: "warning",
        showCancelButton: true
      });
  
      if (!result.isConfirmed) return;
  
      //try {
        const response = await resendauthGPDataDetails({
          ID: id,
          resendAuth: true
        });
        
        if (response?.status) {
          await Swal.fire({
            icon: "success",
            title: "Resent!",
            text:
              response?.message ||
              "Authorization request resent successfully."
          });

          //cacheRef.current = {};
          //fetchData();
          handleSuccess?.();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed!",
            text:
              response?.message ||
              "Unable to resend authorization request."
          });
        }
      // } catch {
      //   Swal.fire("Error!", "", "error");
      // }
    };

    const updateRemarks = (rowData) => {
      console.log("============", rowData);

      openModal({
        mode: "edit",
        id: rowData.id,
        data: rowData,
        isPostRemark:true
      });
    };

    const closeTicketGP = async (id) => {
      try {
        await closeGPTicket({ ID: id, closeTicket: true });
  
        //cacheRef.current = {};
        dispatch(getOutdoorDutyDataResponse());
  
      } catch (err) {
        console.error(err);
      }
    };

    const viewGP = (id) => openModal(null, "view", id);
    const editGP = (rowData) => {
      console.log("============", rowData);

      openModal({
        mode: "edit",
        id: rowData.id,
        data: rowData,
      });
    };

    const deleteGP = async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Delete this Outdoor Duty request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete!"
      });
  
      if (!result.isConfirmed) return;
      console.log("========Dleete payload=====", { deleteOD: true, delteId: id });
      //try {
        //await deleteGPData({ deleteOD: true, delteId: id });
        const response = await deleteGPData({
          deleteOD: true,
          delteId: id
        });
  
        if (response?.status) {
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text:
              response?.message ||
              "Gatepass deleted successfully"
          });

          //cacheRef.current = {};
          //fetchData();
          handleSuccess?.();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed!",
            text:
              response?.message ||
              "Delete failed"
          });
        }
      //} 
      //catch {
      //   Swal.fire("Error!", "Delete failed", "error");
      // }
    };

  const columns = useMemo(() => {
    return outdoorDutyColumns({
      sendAuth,
      resendAuth,
      updateRemarks,
      closeTicketGP,
      viewGP,
      editGP,
      deleteGP
    });
  }, []);

  console.log("==============ListData===========", listData);
    console.log("==============Data===========", filteredData);

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
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Outdoor Duties" },
          ]}
        />
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="card">
        <div className="card-body">
          <div className="row">
            {/* ================= LEFT SIDE OUTDOOR DUTY LIST ================= */}
            <div className="col-xl-3 border-end">
              <SDLCalendar openModal={openModal}/>
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
                {/* ================= TABLE ================= */}
                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  loading={loading}
                  emptyMessage="No outdoor duties found"
                  removableSort
                />
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
