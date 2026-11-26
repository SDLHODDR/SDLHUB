import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHRMSAuthTableDataResponse } from "../../store/hrmsAuthorizationDataSlice";
import { handleError } from "../../../../shared/services/errorHandler";

export const useMastersAuthorizationHandler = (tid = 0) => {
  const dispatch = useDispatch();

  const authMasterData = useSelector((state) => state.hrmsAuthData.data);
  const storeLoading = useSelector((state) => state.hrmsAuthData.loading);
  // The task whose list has finished loading. Until the current task's fetch settles the
  // list counts as loading, so "No data" (or another task's rows) is not shown first.
  const [loadedTid, setLoadedTid] = useState(null);
  const loading = storeLoading || (!!tid && String(loadedTid) !== String(tid));

  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Selected row for detail modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (tid) {

      // Cancel this load if the page closes or loads another list first,
      // so a stale request can't show an error or overwrite newer data.
      // Keep the dispatched request itself: it carries unwrap() and abort().
      // (.finally() would return a plain promise without them.)
      const load = dispatch(getHRMSAuthTableDataResponse({ task_id: tid }));
      load.finally(() => setLoadedTid(tid));
      load.unwrap().catch(error => handleError(error, { context: "Load master authorization requests", fallback: "Unable to load master authorization requests." }));
      return () => load.abort();
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
      handleError(error, { context: "Build master authorization requests rows", notify: false });
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