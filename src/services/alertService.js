import Swal from "sweetalert2";

export const notifySuccess = (message, options = {}) => {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
    customClass: {
      popup: "dreampos-popup",
    },
    didClose: () => {
      options.onClose?.();
    },
  });
};

export const notifyError = (message, options = {}) => {
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
    didClose: () => {
      options.onClose?.();
    }
  });
};

/*export const notifyWarning = (
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
};*/

export const notifyWarning = (
  message,
  title = "Warning",
  options = {}
) => {
  // Automatically detect if message contains HTML markup or if options.isHtml is true
  const isHtml = options.isHtml || (typeof message === "string" && /<[a-z][\s\S]*>/i.test(message));

  return Swal.fire({
    icon: "warning",
    title,
    ...(isHtml ? { html: message } : { text: message }),
    confirmButtonText: "OK",
    customClass: {
      popup: "dreampos-popup",
      confirmButton: "dreampos-btn-warning",
    },
    buttonsStyling: false,
    didClose: () => {
      options.onClose?.();
    },
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
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
     customClass: {
        popup: "dreampos-popup",
        confirmButton: "dreampos-btn-primary",
        cancelButton: "dreampos-btn-outline",
    },
    buttonsStyling: false,
  });
};
