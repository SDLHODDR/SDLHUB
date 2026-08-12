import {
  deleteLRData,
} from "../services/leavesService";
//import { getLeavesDataResponse } from "../../../store/eportal/ePortalLeavesSlice";
import { confirmAction, notifyError, notifySuccess } from "../../../services/alertService";

export const createLeavesHandlers = ({ handleSuccess, openModal }) => {
  
  const updateRemarks = (rowData) => {
    openModal({ mode: "edit", id: rowData.id, data: rowData, isPostRemark: true });
  };

  const viewLR = (id) => openModal(null, "view", id);

  const editLR = (rowData) => {
    openModal({ mode: "edit", id: rowData.id, data: rowData });
  };

  const deleteLR = async (id) => {
    const result = await confirmAction("Delete this Ticket Booking request?");
    if (!result.isConfirmed) return;

    const response = await deleteLRData({ deleteLR: true, delteId: id });
    if (response?.status) {
      notifySuccess(response?.message || "leaves Request deleted successfully");
      handleSuccess?.();
    } else {
      notifyError(response?.message || "Delete failed");
    }
  };

  return { updateRemarks, editLR, deleteLR };
};