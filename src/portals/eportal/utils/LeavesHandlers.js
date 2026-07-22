import Swal from "sweetalert2";
import {
  deleteLRData,
} from "../services/leavesService";
//import { getLeavesDataResponse } from "../../../store/eportal/ePortalLeavesSlice";

export const createLeavesHandlers = ({ handleSuccess, openModal }) => {
  
  const updateRemarks = (rowData) => {
    openModal({ mode: "edit", id: rowData.id, data: rowData, isPostRemark: true });
  };

  const viewLR = (id) => openModal(null, "view", id);

  const editLR = (rowData) => {
    openModal({ mode: "edit", id: rowData.id, data: rowData });
  };

  const deleteLR = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this Ticket Booking request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete!",
    });
    if (!result.isConfirmed) return;

    const response = await deleteLRData({ deleteLR: true, delteId: id });
    if (response?.status) {
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: response?.message || "leaves Request deleted successfully",
      });
      handleSuccess?.();
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: response?.message || "Delete failed",
      });
    }
  };

  return { updateRemarks, editLR, deleteLR };
};