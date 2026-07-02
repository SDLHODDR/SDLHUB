import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { downloadDocuments, downloadDeclarations, getEmployeeDropdown } from "../../services/downloadItrDocs";
import {
  notifySuccess,
  notifyError,
  notifyWarning,
} from "../../../../services/alertService";

const DownloadItrDocs = () => {

  const [type, setType] = useState("single");
  const [financialYear, setFinancialYear] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [empCode, setEmpCode] = useState("");
  const [loading, setLoading] = useState(false);

  // INLINE VALIDATION ERRORS
  const [errors, setErrors] = useState({});

  const [downloadCategory, setDownloadCategory] = useState("documents");

  /*
=========================================
FETCH EMPLOYEES
=========================================
*/
const fetchEmployees = async () => {
  try {
    const response = await getEmployeeDropdown();

    if (response?.status) {
      setEmployeeList(response.data || []);
    }
  } catch (error) {
    console.error("Error loading employees:", error);
  }
};

/*
=========================================
LOAD ON PAGE OPEN
=========================================
*/
useEffect(() => {
  fetchEmployees();
}, []);

  /*
  =========================================
  VALIDATION
  =========================================
  */

  const validateForm = () => {
    const newErrors = {};
    if (!financialYear) {
      newErrors.financialYear = "Please select financial year";
    }

    if (type === "single" && !empCode) {
      newErrors.empCode = "Please select employee";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*
  =========================================
  DOWNLOAD ZIP
  =========================================
  */

  const handleDownload = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);

      const payload = {
        category: downloadCategory,
        type,
        financial_year: financialYear,
        selected_empcode: empCode,
      };

      let response;

		if (downloadCategory === "documents") {
			response = await downloadDocuments(payload);
		} else {
			response = await downloadDeclarations(payload);
		}

      if (!response?.status) {
        notifyError(
          response?.message || "Failed to process request"
        );
        return;
      }
      
      const data = response.data || {};

		/*
		--------------------------------------
		Background Job
		--------------------------------------
		*/

		if (data.action === "background") {
			notifySuccess(response.message);
			return;
		}
		
		/*
		--------------------------------------
		Immediate Download
		--------------------------------------
		*/

		if (data.action === "download" && data.download_url) {

			notifySuccess(response.message);

			window.open(
				data.download_url,
				"_blank"
			);
			
			/*window.open(data.download_url, "_self"); */
			/*
			const link = document.createElement("a");
			link.href = data.download_url;
			link.download = "";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link); */

			return;
		}
		notifyWarning("Unable to download file.");		     

    } catch (error) {
      console.error("Download Error:", error);

      notifyError(
        error?.response?.data?.message ||
        error?.message ||
        "Server error"
      );
    } finally {
      setLoading(false);
    }
  };
  
 const getButtonText = () => {

    if (loading)
        return "Preparing...";

    if (downloadCategory === "declaration") {
        return type === "single"
            ? "Download Declaration"
            : "Generate Declaration";
    }

    return type === "single"
        ? "Download ZIP"
        : "Generate ZIP";
};

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Download ITR Documents</h4>
          </div>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/eportal/download-itr">
                Home
              </Link>
            </li>

            <li className="breadcrumb-item active" aria-current="page">
              Download ITR Documents
            </li>
          </ol>
        </nav>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row align-items-end g-3">

             {/* Category */}
            <div className={type === "single" ? "col-lg-2 col-md-6 mb-3" : "col-lg-3 col-md-4 mb-3"}>             
              <label className="form-label">
                Download Category
              </label>

              <select
                className="form-control"
                value={downloadCategory}
                onChange={(e) => setDownloadCategory(e.target.value)}
              >
                <option value="documents">
                  ITR Documents
                </option>

                <option value="declaration">
                  ITR Declaration
                </option>
              </select>
            </div>

            {/* DOWNLOAD TYPE */}
            <div className={type === "single" ? "col-lg-2 col-md-6 mb-3" : "col-lg-3 col-md-4 mb-3"}>          
              <label className="form-label">
                Download Type
              </label>

              <select
                className="form-control"
                value={type}
                onChange={(e) => {

                  setType(e.target.value);

                  // CLEAR EMPLOYEE ERROR
                  setErrors((prev) => ({
                    ...prev,
                    empCode: "",
            
                  }));
                }}
              >
                <option value="single"> Single Employee </option>
                <option value="all"> All Employees </option>
              </select>
            </div>

            {/* FINANCIAL YEAR */}
            <div className={type === "single" ? "col-lg-2 col-md-6 mb-3" : "col-lg-3 col-md-4 mb-3"}>            
              <label className="form-label">
                Financial Year
              </label>

              <select
                className={`form-control ${errors.financialYear
                  ? "is-invalid"
                  : ""
                  }`}
                value={financialYear}
                onChange={(e) => {

                  setFinancialYear(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    financialYear: "",
                  }));
                }}
              >
                <option value=""> Select Financial Year </option>
                <option value="25-26">25-26</option>
                <option value="26-27">26-27</option>
              </select>

              {errors.financialYear && (
                <div className="invalid-feedback d-block">
                  {errors.financialYear}
                </div>
              )}

            </div>

            {/* EMPLOYEE */}
            {type === "single" && (

              <div className="col-lg-4 col-md-6 mb-3">
                <label className="form-label">
                  Employee Code
                </label>

                <input
                  list="employeeList"
                  className={`form-control ${errors.empCode
                    ? "is-invalid"
                    : ""
                    }`}
                  placeholder="Enter or Select Employee"
                  value={empCode}
                  onChange={(e) => {
                    setEmpCode(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      empCode: "",
                    }));
                  }}
                />

                <datalist id="employeeList">
                  {employeeList.map((emp, index) => (
                    <option
                      key={index}
                      value={emp.EMP_CODE}
                    >
                      {emp.EMP_CODE} - {emp.EMP_NAME}
                    </option>
                  ))}
                </datalist>

                {errors.empCode && (
                  <div className="invalid-feedback d-block">
                    {errors.empCode}
                  </div>
                )}

              </div>
            )}

            {/* BUTTON */}         
            <div className={type === "single"
              ? "col-lg-2 col-md-6 mb-3"
              : "col-lg-3 col-md-4 mb-3"}>

              <button
				  className="btn w-100 mt-md-0 mt-2"
				  onClick={handleDownload}
				  disabled={loading}
				  style={{
					background: "#FE9F43",
					color: "#fff",
					fontWeight: "600",
					height: "42px",
					borderRadius: "6px",
					border: "none",
				  }}
				>
				{getButtonText()}
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadItrDocs;
