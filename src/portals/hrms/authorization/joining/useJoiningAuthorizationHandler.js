import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHRMSAuthTableDataResponse } from "../../store/hrmsAuthorizationDataSlice";
import { handleError } from "../../../../shared/services/errorHandler";
//import { getHRMSAuthroizationTaskCount } from "../../store/hrmsAuthorizationCountSlice";

export const useJoiningAuthorizationHandler = (tid = 0) => {
  const dispatch = useDispatch();
  const authJOINdata = useSelector((state) => state.hrmsAuthData.data);
  const storeLoading = useSelector((state) => state.hrmsAuthData.loading);
  // The task whose list has finished loading. Until the current task's fetch settles the
  // list counts as loading, so "No data" (or another task's rows) is not shown first.
  const [loadedTid, setLoadedTid] = useState(null);
  const loading = storeLoading || (!!tid && String(loadedTid) !== String(tid));
  const authExitArrdata = useSelector((state) => state.hrmsAuthData.exit_arr);
  const authJOINArrdata = useSelector((state) => state.hrmsAuthData.joining_arr);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  

  useEffect(() => {

    // Cancel this load if the page closes or loads another list first,
    // so a stale request can't show an error or overwrite newer data.
    const load = dispatch(getHRMSAuthTableDataResponse({ task_id: tid })).finally(() => setLoadedTid(tid));
    load.unwrap().catch(error => handleError(error, { context: "Load joining requests", fallback: "Unable to load joining requests." }));
    return () => load.abort();

  }, [dispatch, tid, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      // Newest tasks first (task IDs only increase).
      const flattened = [...(authJOINdata || [])]
        .sort((a, b) => (Number(b.ID) || 0) - (Number(a.ID) || 0))
        .map((item) => {
          return {
            ...item,
            exit_arr_data: authExitArrdata || "",
            join_arr_data: authJOINArrdata || "",
          };
        });
      if (mounted) setListData(flattened);
    } catch (error) {
      handleError(error, { context: "Build joining requests rows", notify: false });
      if (mounted) setListData([]);
    }
    return () => {
      mounted = false;
    };
  }, [authJOINdata]);

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
        (item.TRAN_DESC || "").toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  console.log("==================authJOINdata=================", authJOINdata);
  console.log("==================listData=================", listData);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    refresh,
  };
};