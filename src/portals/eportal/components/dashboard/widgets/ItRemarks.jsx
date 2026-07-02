import { useEffect } from "react";
import Swal from "sweetalert2";

const ITRemarksAlert = ({ data }) => {

  useEffect(() => {
    if (!data || !data.remarks) return;

    Swal.fire({
      width: 420,
      icon: "warning",
      title: `<small>IT Declaration Message</small>`,
      html: `
        <div style="font-size:14px">
          <div style="margin-bottom:10px;">
            <strong>"${data.remarks}"</strong>
          </div>
          <div style="font-size:12px;color:#666;">
            By <i>${data.by}</i>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Go to Declaration",
      cancelButtonText: "Close",
      focusConfirm: false
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/it-declaration"; // update route
      }
    });

  }, [data]);

  return null;
};

export default ITRemarksAlert;
