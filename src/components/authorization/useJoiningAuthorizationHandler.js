import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHRMSAuthTableDataResponse } from "../../store/hrms/hrmsAuthorizationDataSlice";
//import { getHRMSAuthroizationTaskCount } from "../../store/hrms/hrmsAuthorizationCountSlice";

export const useJoiningAuthorizationHandler = (tid = 0) => {
  const dispatch = useDispatch();
  const authJOINdata = useSelector((state) => state.hrmsAuthData.data);
  const loading = useSelector((state) => state.hrmsAuthData.loading);
  const authExitArrdata = useSelector((state) => state.hrmsAuthData.exit_arr);
  const authJOINArrdata = useSelector((state) => state.hrmsAuthData.joining_arr);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  

  useEffect(() => {
    dispatch(getHRMSAuthTableDataResponse({ task_id: tid }));
  }, [dispatch, tid, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (authJOINdata || []).map((item) => {
        return {
          ...item,
          exit_arr_data: authExitArrdata || "",
          join_arr_data: authJOINArrdata || "",
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

  return {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
  };
};