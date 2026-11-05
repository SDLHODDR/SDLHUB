/**
 * Downloads a blob response from an API.
 *
 * @param {Object} response Axios response
 * @param {string} defaultFileName Default filename if header is missing
 */
export const downloadFile = (
  response,
  defaultFileName = "download"
) => {
  if (!response?.data) {
    throw new Error("No file received from server.");
  }

  let fileName = defaultFileName;

  const contentDisposition =
    response.headers?.["content-disposition"];

  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename\*?=(?:UTF-8'')?"?([^"]+)"?/i
    );

    if (match?.[1]) {
      fileName = decodeURIComponent(match[1]);
    }
  }

  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data]);

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};