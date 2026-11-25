import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../store/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../store/ePortalAuthorizationCountSlice";
import { useLocation } from "react-router-dom";
import { handleError } from "../../../shared/services/errorHandler";

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

  const segments = location.pathname.split("/").filter(Boolean);
  const currentTaskId = segments[segments.length - 1]; // "21" or "349"

  useEffect(() => {
    // Cancel this load if the page closes or loads another list first,
    // so a stale request can't show an error or overwrite newer data.
    const load = dispatch(getAuthDataResponse({ task_id: currentTaskId }));
    load.unwrap().catch(error => handleError(error, { context: "Load outdoor duty requests", fallback: "Unable to load outdoor duty requests." }));
    return () => load.abort();
  }, [dispatch, refreshKey, currentTaskId]);

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
      handleError(error, { context: "Build outdoor duty requests rows", notify: false });
      if (mounted) setListData([]);
    }
    return () => {
      mounted = false;
    };
  }, [authODdata]);

  const filteredData = useMemo(() => {

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