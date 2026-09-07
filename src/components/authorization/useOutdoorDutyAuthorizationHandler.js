import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../../store/eportal/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";
import { useLocation } from "react-router-dom";

export const useOutdoorDutyAuthorizationHandler = () => {
  const dispatch = useDispatch();
  const authODdata = useSelector((state) => state.eportalAuthData.data);
  const loading = useSelector((state) => state.eportalAuthData.loading);

  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedOutduty, setSelectedOutduty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Assuming your route is defined like: /eportal/taskauthorization/:taskId
  const location = useLocation();
  // pathname will be something like "/eportal/taskauthorization/21" or ".../349"
  //const isTask21 = location.pathname.endsWith("/21");
  //const segments = location.pathname.split("/").filter(Boolean); // removes empty strings
  //const lastSegment = segments[segments.length - 1];
  //const isTask21 = lastSegment === "21";

  const segments = location.pathname.split("/").filter(Boolean);
  const currentTaskId = segments[segments.length - 1]; // "21" or "349"

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
          POST_REMARKS: details.POST_REMARKS || "",
          POST_REMARKS_DOC: details.POST_REMARKS_DOC || "",
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

  // const filteredData = useMemo(() => {
  //   if (!searchQuery.trim()) return listData;
  //   const query = searchQuery.trim().toLowerCase();
  //   return listData.filter(
  //     (item) =>
  //       (item.OUT_TYPE || "").toLowerCase().includes(query) ||
  //       (item.REMARKS || "").toLowerCase().includes(query) ||
  //       (item.REQUEST_FOR || "").toLowerCase().includes(query) ||
  //       (item.CREATED_BY || "").toLowerCase().includes(query),
  //   );
  // }, [searchQuery, listData]);

  const filteredData = useMemo(() => {
    // const scopedData = isTask21
    // ? listData.filter((item) => String(item.TASK_ID) === "21")
    // : listData;

    // // Step 2: apply search on top of the scoped dataset
    // if (!searchQuery.trim()) return scopedData;

    // Scope to whichever TASK_ID matches the current route, not just "21"
    const scopedData = listData.filter(
      (item) => String(item.TASK_ID) === currentTaskId
    );

    if (!searchQuery.trim()) return scopedData;


    const query = searchQuery.trim().toLowerCase();
    return scopedData.filter(
      (item) =>
        (item.OUT_TYPE || "").toLowerCase().includes(query) ||
        (item.REMARKS || "").toLowerCase().includes(query) ||
        (item.REQUEST_FOR || "").toLowerCase().includes(query) ||
        (item.CREATED_BY || "").toLowerCase().includes(query),
    );
  }, [searchQuery, listData, currentTaskId]);

  const openModal = useCallback((row = null) => {
    setSelectedOutduty(row || {});
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedOutduty(null);
    setShowModal(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    dispatch(getAuthroizationTaskCount());
  }, [dispatch]);

  return {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedOutduty,
    showModal,
    openModal,
    closeModal,
    handleModalSuccess,
    currentTaskId
  };
};