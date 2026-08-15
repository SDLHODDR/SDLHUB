import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../../store/eportal/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";

export const useTicketBookingAuthorizationHandler = () => {
  const dispatch = useDispatch();
  const authTBdata = useSelector((state) => state.eportalAuthData.data);
  const loading = useSelector((state) => state.eportalAuthData.loading);

  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTicketBooking, setSelectedTicketBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const openModal = useCallback((row = null) => {
    setSelectedTicketBooking(row || {});
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedTicketBooking(null);
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
    selectedTicketBooking,
    showModal,
    openModal,
    closeModal,
    handleModalSuccess,
  };
};