import { useEffect, useState, useMemo } from "react";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import OutdoorDutyAuthorizationModal from "../../portals/eportal/modal/OutdoorDutyAuthorizationModal";
//import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../../store/eportal/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";

const OutdoorDutyAuthorization = () => {
  const dispatch = useDispatch();
  const authODdata = useSelector((state) => state.eportalAuthData.data);
  const loading = useSelector((state) => state.eportalAuthData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(getAuthDataResponse({ task_id: 349 }));
  }, [dispatch, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (authODdata || []).map((item) => {
        const details = Array.isArray(item.DETAILS) ? {} : item.DETAILS || {};
        return {
          ...item,
          OUT_TYPE: details.OUT_TYPE || "",
          REMARKS: details.REMARKS || "",
          GPASS_DATE: details.GPASS_DATE || "",
          DETAIL_STATUS: details.STATUS || "",
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
  }, [authODdata]);

  // useMemo now runs on every render, no matter what
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        (item.OUT_TYPE || "").toLowerCase().includes(query) ||
        (item.REMARKS || "").toLowerCase().includes(query) ||
        (item.REQUEST_FOR || "").toLowerCase().includes(query) ||
        (item.CREATED_BY || "").toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  const OUT_TYPE_LABELS = {
    OI: "In/Out same day",
    OD: "Out for full day",
    FO: "First Half Out",
    SO: "Second Half Out",
    FW: "Field Work",
    TO: "Tour",
  };
  /*
   ================= Form modal constants ================= */
  const [selectedOutduty, setSelectedOutduty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (row = null) => {
    if (row) {
      setSelectedOutduty(row); // null = add new booking
    } else {
      setSelectedOutduty({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedOutduty(null);
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
    {
      header: "Task From",
      body: (rowData) => {
        const taskfor = rowData?.CREATED_BY || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Task From"
          >
            {taskfor}
          </a>
        );
      },
    },
    {
      field: "OUT_TYPE",
      header: "OUT TYPE",
      sortable: true,
      body: (rowData) => {
        const code = rowData?.OUT_TYPE;
      
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="OUT TYPE"
          >
            {OUT_TYPE_LABELS[code] || code || "-"}
          </a>
        );
      },
    },
    {
      field: "REMARKS",
      header: "REMARKS",
      body: (rowData) => {
        const text = rowData?.REMARKS || "-";
        const trimmed = text.length > 15 ? `${text.substring(0, 15)}...` : text;
        return (
          <div className="remarks-wrapper">
            <div className="remarks-main" title={text}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openModal(rowData);
                }}
                title="Remarks"
              >
                {trimmed}
              </a>
            </div>
          </div>
        );
      },
      style: { minWidth: "450px" },
    },
    { field: "GPASS_DATE", header: "GPASS DATE", sortable: true },
    { field: "CREATED_ON", header: "Created On", sortable: true },
    {
      field: "STATUS",
      header: "Status",
      body: (rowData) => {
        return (
          <span
            className={`badge badge-${rowData.statusColor} d-inline-flex align-items-center badge-xs`}
          >
            {rowData.statusText}
          </span>
        );
      },
    },
  ];

  // Conditional return happens LAST, after every hook has been called
  if (loading) return <div>Loading...</div>;

  console.log("===========OD Data Authorization=========", authODdata);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Outdoor Duty Authorization</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Outdoor Duty Authorization" },
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
        <OutdoorDutyAuthorizationModal
          outddorduty={selectedOutduty}
          isOpen={true}
          onClose={closeModal}
          onSuccess={() => {
            console.log("Refreshing this table...");
            setRefreshKey((prev) => prev + 1);
            dispatch(getAuthroizationTaskCount()); // refetches the badge/counter
          }}
        />
      )}
    </>
  );
};

export default OutdoorDutyAuthorization;
