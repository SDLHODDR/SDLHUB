import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../../store/eportal/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";

export const useLeavesAuthorizationHandler = () => {
  const dispatch = useDispatch();
  const authLRdata = useSelector((state) => state.eportalAuthData.data);
  const loading = useSelector((state) => state.eportalAuthData.loading);

  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedLeaves, setSelectedLeaves] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const openModal = useCallback((row = null) => {
    setSelectedLeaves(row || {});
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedLeaves(null);
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
    selectedLeaves,
    showModal,
    openModal,
    closeModal,
    handleModalSuccess,
  };
};