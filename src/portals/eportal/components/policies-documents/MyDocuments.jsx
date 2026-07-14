import { useEffect, useState, useRef } from "react";
import { getPayslips } from "../../services/payslipService";
import { getDocuments } from "../../services/documentService";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

const MyDocuments = () => {
  const [payslips, setPayslips] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [loadingPayslip, setLoadingPayslip] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);

  const [error, setError] = useState(null);

  const payslipFetchedRef = useRef(false);
  const documentFetchedRef = useRef(false);

  /* ================= FETCH DATA ================= */

  const fetchPayslips = async () => {
    if (payslipFetchedRef.current) return; //prevent duplicate call

    payslipFetchedRef.current = true;
    setLoadingPayslip(true);

    try {
      const response = await getPayslips();

      const payslips =
        response?.status && Array.isArray(response.data)
          ? response.data
          : [];

      setPayslips(payslips);

      setSelectedPdf(
        payslips.length > 0 ? payslips[0].downloadUrl : null
      );

      // Clear any previous error
      setError(null);
    } catch (err) {
      // Ignore cancelled requests
      if (!err.cancelled) {
        console.error("Payslip fetch error:", err);
        setError(err.message || "Failed to load payslips");
      }

      setPayslips([]);
      setSelectedPdf(null);
    } finally {
      setLoadingPayslip(false);
    }
  };

  const fetchDocuments = async () => {
    if (documentFetchedRef.current) return; // prevent duplicate call
    documentFetchedRef.current = true;
    setLoadingDocs(true);

    try {
      const response = await getDocuments();

      const documents =
        response?.status && Array.isArray(response.data)
          ? response.data
          : [];

      setDocuments(documents);

      setSelectedDoc(
        documents.length > 0 ? documents[0].previewUrl : null
      );
    } catch (err) {
      // Ignore cancelled requests
      if (!err.cancelled) {
        console.error("Document fetch error", err);
      }

      setDocuments([]);
      setSelectedDoc(null);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchDocuments();
  }, []);

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>My Documents</h4>
          </div>
        </div>

         <BreadcrumbNav
          items={[
              { text: "Home", link: "/eportal/dashboard" },
              { text: "My Documents" },
          ]}
          />

      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="card vh-100">
        <div className="card-body">

          <ul className="nav nav-tabs nav-tabs-bottom border-bottom mb-3">
            <li className="nav-item">
              <a
                className="nav-link active"
                href="#bottom-tab1"
                data-bs-toggle="tab"
              >
                Payslips
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="#bottom-tab2"
                data-bs-toggle="tab"
              >
                My Documents
              </a>
            </li>
          </ul>

          <div className="tab-content">

            {/* ================= PAYSLIPS TAB ====================== */}

            <div className="tab-pane show active" id="bottom-tab1">
              <div className="row h-100">

                {/* LEFT LIST */}
                <div className="col-xl-3 border-end">
                  <nav className="nav nav-tabs flex-column nav-style-5">

                    {loadingPayslip && (
                      <div className="text-muted p-2">
                        Loading payslips...
                      </div>
                    )}

                    {error && (
                      <div className="text-danger p-2">
                        {error}
                      </div>
                    )}

                    {!loadingPayslip && payslips.length === 0 && (
                      <div className="text-muted p-2">
                        No Payslips Available
                      </div>
                    )}

                    {payslips.map((item) => (
                      <button
                        key={item.id || item.downloadUrl}
                        type="button"
                        className={`nav-link text-start 
                          ${selectedPdf === item.downloadUrl ? "active" : ""}`}
                        onClick={() => {
                          if (selectedPdf !== item.downloadUrl) {
                            setPdfLoading(true);
                            setSelectedPdf(item.downloadUrl);
                          }
                        }}
                      >
                        <i className="far fa-file-pdf me-2"></i>
                        {item.monthName} - {item.year}
                      </button>
                    ))}

                  </nav>
                </div>

                {/* RIGHT PREVIEW */}
                <div className="col-xl-9 d-flex flex-column">

                  {selectedPdf ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Payslip Preview</h6>
                      </div>

                      <div className="position-relative flex-grow-1">

                        {pdfLoading && (
                          <div className="position-absolute top-50 start-50 translate-middle">
                            <div className="spinner-border text-warning" role="status"></div>
                          </div>
                        )}

                        <iframe
                          src={`${selectedPdf}#navpanes=0`}
                          title="Payslip Preview"
                          width="100%"
                          onLoad={() => setPdfLoading(false)}
                          style={{
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            height: "85vh",
                            opacity: pdfLoading ? 0 : 1,
                            transition: "opacity 0.3s ease-in-out"
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-muted d-flex align-items-center justify-content-center h-100">
                      Select a payslip to preview
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* ================= DOCUMENTS TAB ===================== */}

            <div className="tab-pane" id="bottom-tab2">
              <div className="row h-100">

                {/* LEFT LIST */}
                <div className="col-xl-3 border-end">
                  <nav className="nav nav-tabs flex-column nav-style-5">

                    {loadingDocs && (
                      <div className="text-muted p-2">
                        Loading documents...
                      </div>
                    )}

                    {!loadingDocs && documents.length === 0 && (
                      <div className="text-muted p-2">
                        No Documents Available
                      </div>
                    )}

                    {documents.map((doc) => (
                      <button
                        key={doc.docId}
                        type="button"
                        className={`nav-link text-start 
                          ${selectedDoc === doc.previewUrl ? "active" : ""}`}
                        onClick={() => {
                          if (selectedDoc !== doc.previewUrl) {
                            setDocLoading(true);
                            setSelectedDoc(doc.previewUrl);
                          }
                        }}
                      >
                        <i className="far fa-file-pdf me-2"></i>
                        {doc.docDesc}
                        <br />
                        <small>{doc.docDate}</small>
                      </button>
                    ))}

                  </nav>
                </div>

                {/* RIGHT DOCUMENT PREVIEW */}
                <div className="col-xl-9 d-flex flex-column">

                  {selectedDoc ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Document Preview</h6>
                      </div>

                      <div className="position-relative flex-grow-1">

                        {docLoading && (
                          <div className="position-absolute top-50 start-50 translate-middle">
                            <div className="spinner-border text-warning" role="status"></div>
                          </div>
                        )}

                        <iframe
                          src={`${selectedDoc}#navpanes=0`}
                          title="Document Preview"
                          width="100%"
                          onLoad={() => setDocLoading(false)}
                          style={{
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            height: "85vh",
                            opacity: docLoading ? 0 : 1,
                            transition: "opacity 0.3s ease-in-out"
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-muted d-flex align-items-center justify-content-center h-100">
                      Select a document to preview
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default MyDocuments;
