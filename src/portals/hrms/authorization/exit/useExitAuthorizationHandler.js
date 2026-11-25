import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHRMSAuthTableDataResponse } from "../../store/hrmsAuthorizationDataSlice";
import { handleError } from "../../../../shared/services/errorHandler";

export const useExitAuthorizationHandler = (tid = 0) => {
  const dispatch = useDispatch();
  const authExitdata = useSelector((state) => state.hrmsAuthData.data);
  const authExitArrdata = useSelector((state) => state.hrmsAuthData.exit_arr);
  const authJOINArrdata = useSelector((state) => state.hrmsAuthData.joining_arr);
  const storeLoading = useSelector((state) => state.hrmsAuthData.loading);
  // The task whose list has finished loading. Until the current task's fetch settles the
  // list counts as loading, so "No data" (or another task's rows) is not shown first.
  const [loadedTid, setLoadedTid] = useState(null);
  const loading = storeLoading || (!!tid && String(loadedTid) !== String(tid));

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Selected row for detail modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (tid) {
      // Cancel this load if the page closes or loads another list first,
      // so a stale request can't show an error or overwrite newer data.
      const load = dispatch(getHRMSAuthTableDataResponse({ task_id: tid })).finally(() => setLoadedTid(tid));
      load.unwrap().catch(error => handleError(error, { context: "Load exit requests", fallback: "Unable to load exit requests." }));
      return () => load.abort();
   }
  }, [dispatch, tid, refreshKey]);

  // The store may still hold the previous task list right after navigation.
  const listData = useMemo(
    () =>
      (authExitdata || [])
        .filter((item) => !item.TASK_ID || String(item.TASK_ID) === String(tid))
        .map((item) => ({
          ...item,
          // Task IDs increase with creation time; CREATED_ON is a DD-MON-YY string.
          CREATED_SORT: Number(item.ID) || 0,
          exit_arr_data: authExitArrdata || "",
          join_arr_data: authJOINArrdata || "",
        })),
    [authExitdata, authExitArrdata, authJOINArrdata, tid]
  );

  // Client-side text search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        (item.CREATED_BY_NAME || "").toLowerCase().includes(query) ||
        (item.CNAME || "").toLowerCase().includes(query) ||
        (item.DIVSN || "").toLowerCase().includes(query) ||
        (item.DNAME || "").toLowerCase().includes(query) ||
        (item.UDF_2 || "").toLowerCase().includes(query) ||
        (item.TRAN_DESC || "").toLowerCase().includes(query)
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
