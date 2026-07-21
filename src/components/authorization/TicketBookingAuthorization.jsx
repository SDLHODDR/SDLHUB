import { useEffect, useState, useMemo } from "react";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import TicketBookingAuthorizationModal from "../../portals/eportal/modal/TicketBookingAuthorizationModal";
//import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../../store/eportal/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";

const TicketBookingAuthorization = () => {
  const dispatch = useDispatch();
  const authTBdata = useSelector((state) => state.eportalAuthData.data);
  const loading = useSelector((state) => state.eportalAuthData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(getAuthDataResponse({ task_id: 346 }));
  }, [dispatch, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (authTBdata || []).map((item) => {
        const details = Array.isArray(item.DETAILS) ? {} : item.DETAILS || {};
        return {
          ...item,
          REQ_DATE: details.REQ_DATE || "",
          REMARKS: details.REMARKS || "",
          TRVL_CLASS: details.TRVL_CLASS || "",
          PERSON_NAME: details.PERSON_NAME || "",
          TRVL_MODE: details.TRVL_MODE || "",
          TRVL_DATE: details.TRVL_DATE || "",
          TRVL_FROM_LOC: details.TRVL_FROM_LOC || "",
          TRVL_TO_LOC: details.TRVL_TO_LOC || "",
          TRVL_FT_NAME: details.TRVL_FT_NAME || "",
          TRVL_FT_NO: details.TRVL_FT_NO || "",
          TTNT_DEPR_TIME: details.TTNT_DEPR_TIME || "",
          TTNT_ARVL_TIME: details.TTNT_ARVL_TIME || "", 
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
  }, [authTBdata]);

  //useMemo now runs on every render, no matter what
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        (item.REMARKS || "").toLowerCase().includes(query) ||
        (item.REQUEST_FOR || "").toLowerCase().includes(query) ||
        (item.CREATED_BY || "").toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  console.log("______---- listData ------_____", listData);
  /* ================= Form modal constants ================= */
  const [selectedTicketBooking, setSelectedTicketBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (row = null) => {
    //console.log("================ROW===================", row);
    if (row) {
      setSelectedTicketBooking(row); // null = add new booking
    } else {
      setSelectedTicketBooking({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTicketBooking(null);
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
      // style: { minWidth: "450px" },
    },
    {
      field: "REQ_DATE",
      header: "Request DATE",
      sortable: true,
      body: (rowData) => {
        const reqDate = rowData?.REQ_DATE || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Request DATE"
          >
            {reqDate}
          </a>
        );
      },
    },
    {
      field: "TRVL_CLASS",
      header: "Class",
      sortable: true,
      body: (rowData) => {
        const trvlClass = rowData?.TRVL_CLASS || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Travel Class"
          >
            {trvlClass}
          </a>
        );
      },
    },
    {
      field: "TRVL_MODE",
      header: "Mode",
      sortable: true,
      body: (rowData) => {
        const trvlMode = rowData?.TRVL_MODE || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Travel Mode"
          >
            {trvlMode}
          </a>
        );
      },
    },
    {
      field: "TRVL_DATE",
      header: "Travel Date",
      sortable: true,
      body: (rowData) => {
        const trvlDate = rowData?.TRVL_DATE || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Travel Date"
          >
            {trvlDate}
          </a>
        );
      },
    },
    {
      field: "TRVL_FROM_LOC",
      header: "From",
      sortable: true,
      body: (rowData) => {
        const fromLoc = rowData?.TRVL_FROM_LOC || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="From"
          >
            {fromLoc}
          </a>
        );
      },
    },
    {
      field: "TRVL_TO_LOC",
      header: "To",
      sortable: true,
      body: (rowData) => {
        const toLoc = rowData?.TRVL_TO_LOC || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="To"
          >
            {toLoc}
          </a>
        );
      },
    },
    {
      field: "TRVL_FT_NAME",
      header: "Train/Flight",
      sortable: true,
      body: (rowData) => {
        const ftName = rowData?.TRVL_FT_NAME || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Train/Flight"
          >
            {ftName}
          </a>
        );
      },
    },
    {
      field: "TRVL_FT_NO",
      header: "Number",
      sortable: true,
      body: (rowData) => {
        const ftNo = rowData?.TRVL_FT_NO || "-";
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Number"
          >
            {ftNo}
          </a>
        );
      },
    },

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

  console.log("===========TB Data Authorization=========", authTBdata);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Ticket Booking Authorization</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Ticket Booking Authorization" },
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
        <TicketBookingAuthorizationModal
          ticketbooking={selectedTicketBooking}
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

export default TicketBookingAuthorization;
