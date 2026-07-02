import Swal from "sweetalert2";

export const notifySuccess = (message) => {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    confirmButtonText: "OK",
    customClass: {
      popup: "dreampos-popup",
      confirmButton: "dreampos-btn-primary",
    },
    buttonsStyling: false,
  });
};

export const notifyError = (message) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonText: "OK",
    customClass: {
      popup: "dreampos-popup",
      confirmButton: "dreampos-btn-danger",
    },
    buttonsStyling: false,
  });
};

export const notifyWarning = (
  message,
  title = "Warning"
) => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
    customClass: {
      popup: "dreampos-popup",
      confirmButton: "dreampos-btn-warning",
    },
    buttonsStyling: false,
  });
};

export const confirmAction = async (
  title = "Are you sure?",
  text = "This action cannot be undone"
) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Continue",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "dreampos-popup",
      confirmButton: "dreampos-btn-warning",
      cancelButton: "dreampos-btn-outline",
    },
    buttonsStyling: false,
  });
};
