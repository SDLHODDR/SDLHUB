import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHRMSAuthTableDataResponse } from "../../store/hrms/hrmsAuthorizationDataSlice";

export const useMastersAuthorizationHandler = (tid = 0) => {
  const dispatch = useDispatch();

  const authMasterData = useSelector((state) => state.hrmsAuthData.data);
  const loading = useSelector((state) => state.hrmsAuthData.loading);

  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Selected row for detail modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (tid) {
      dispatch(getHRMSAuthTableDataResponse({ task_id: tid }));
    }
  }, [dispatch, tid, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const records = (authMasterData || []).map((item) => ({
        ...item,
      }));
      if (mounted) setListData(records);
    } catch (error) {
      console.error("Failed to load master authorization records:", error);
      if (mounted) setListData([]);
    }
    return () => {
      mounted = false;
    };
  }, [authMasterData]);

  // Client-side text search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();

    return listData.filter(
      (item) =>
        (item.EMP_CODE_FOR || "").toLowerCase().includes(query) ||
        (item.EMP_NAME || "").toLowerCase().includes(query) ||
        (item.CREATED_BY_NAME || "").toLowerCase().includes(query) ||
        (item.DIVSN || "").toLowerCase().includes(query) ||
        (item.DNAME || "").toLowerCase().includes(query) ||
        (item.TRAN_DESC || "").toLowerCase().includes(query) ||
        (item.TASK_GRP_DESC || "").toLowerCase().includes(query)
    );
  }, [searchQuery, listData]);

  const openModal = useCallback((record) => {
    setSelectedRecord(record);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedRecord(null);
    setShowModal(false);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedRecord,
    showModal,
    openModal,
    closeModal,
    refreshList,
  };
};