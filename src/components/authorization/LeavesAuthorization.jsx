import { useEffect, useState, useMemo } from "react";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";

import LeavesAuthorizationModal from "../../portals/eportal/modal/LeavesAuthorizationModal";
//import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../../store/eportal/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";

const LeavesAuthorization = () => {
  const dispatch = useDispatch();
  const authLRdata = useSelector((state) => state.eportalAuthData.data);
  const loading = useSelector((state) => state.eportalAuthData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(getAuthDataResponse({ task_id: 109 }));
  }, [dispatch, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (authLRdata || []).map((item) => {
        const details = Array.isArray(item.DETAILS) ? {} : item.DETAILS || {};
        return {
          ...item,
          LVE_DATE_FR: details.LVE_DATE_FR || "",
          LVE_DATE_TO: details.LVE_DATE_TO || "",
           LVE_START_ON: details.LVE_START_ON || "",
            LVE_END_ON: details.LVE_END_ON || "",
          REMARKS: details.REMARKS || "",
          LVE_CODE: details.LVE_CODE || "",
          TOTAL_DAYS: details.TOTAL_DAYS || "",
           REASON: details.REASON || "",
          status: details.status || "",
          STATUS: details.STATUS || "",
          statusColor: details.statusColor || "",
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
  }, [authLRdata]);

  const LeaveStartEndArr = {
    B: "Beginning Of The Day",
    M: "Middle Of The Day",
    E: "End Of The Day",
  };

  //useMemo now runs on every render, no matter what
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        (item.REMARKS || "").toLowerCase().includes(query) ||
        (item.REQUEST_FOR || "").toLowerCase().includes(query) ||
        (item.LVE_CODE || "").toLowerCase().includes(query) ||
        (item.CREATED_BY || "").toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  
  /* ================= Form modal constants ================= */
  const [selectedLeaves, setSelectedLeaves] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (row = null) => {
    //console.log("================ROW===================", row);
    if (row) {
      setSelectedLeaves(row); // null = add new booking
    } else {
      setSelectedLeaves({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLeaves(null);
    setShowModal(false);
  };

  const columns = [
    // { field: "REQUEST_FOR", header: "Task For", sortable: true },
    {
      header: "Task For",
      body: (rowData) => {
        const taskfor = rowData?.REQUEST_FOR || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Task For"
          >
            {taskfor}
          </a>
        );
      },
    },
    { field: "CREATED_BY", header: "Task From", sortable: true },
  
    {
      field: "REMARKS",
      header: "REMARKS",
      body: (rowData) => {
        const text = rowData?.DETAILS.REASON || "-";
        const trimmed = text.length > 15 ? `${text.substring(0, 15)}...` : text;
        return (
          <div className="remarks-wrapper">
            <div className="remarks-main" title={text}>
              {trimmed}
            </div>
          </div>
        );
      },
      // style: { minWidth: "450px" },
    },
    { field: "LVE_DATE_FR", header: "From", sortable: true },
    { field: "LVE_DATE_TO", header: "TO", sortable: true },
    {
      field: "LVE_START_ON",
      header: "START",
      sortable: true,
      body: (rowData) => LeaveStartEndArr[rowData?.LVE_START_ON] || rowData?.LVE_START_ON || "-",
    },
    {
      field: "LVE_END_ON",
      header: "END",
      sortable: true,
      body: (rowData) => LeaveStartEndArr[rowData?.LVE_END_ON] || rowData?.LVE_END_ON || "-",
    },
     { field: "LVE_CODE", header: "From", sortable: true },
     { field: "TOTAL_DAYS", header: "Days", sortable: true },
    { field: "CREATED_ON", header: "Created On", sortable: true },
    // {
    //   field: "STATUS",
    //   header: "Status",
    //   body: (rowData) => {
    //     return (
    //       <span
    //         className={`badge badge-${rowData.statusColor} d-inline-flex align-items-center badge-xs`}
    //       >
    //         {rowData.statusText}
    //       </span>
    //     );
    //   },
    // },
  ];

  // Conditional return happens LAST, after every hook has been called
  if (loading) return <div>Loading...</div>;

  console.log("===========TB Data Authorization=========", authLRdata);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Leaves Authorization</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Leaves Authorization" },
          ]}
        />
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-lg-4 col-md-6 col-12">
              <SDLSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search Policies..."
                style={{ width: "120px" }}
              />
            </div>
          </div>

          <div className="company-policies-table">
            <SDLDataTable
              data={filteredData}
              columns={columns}
              loading={loading}
              emptyMessage="No Tasks found"
              className="company-policies-grid"
              removableSort
            />
          </div>
        </div>
      </div>
      {/* ================= MODAL ================= */}
      {showModal && (
        <LeavesAuthorizationModal
          leaves={selectedLeaves}
          isOpen={true}
          onClose={closeModal}
          onSuccess={() => {
            console.log("Refreshing this table...");
            setRefreshKey(prev => prev + 1);
            dispatch(getAuthroizationTaskCount()); // refetches the badge/counter
          }}
        />
      )}
    </>
  );
};

export default LeavesAuthorization;
