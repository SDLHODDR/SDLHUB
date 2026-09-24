import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Calendar } from "primereact/calendar";
import SDLReactSelect from "../../../components/SDLReactSelect";
import useApprLevelTabHandler from "./useApprLevelTabHandler";
import { getApprLevelColumns, renderApprLevelColumns } from "./apprLevelColumns";
import { isOrganogramReadOnly } from "./organogramStatus";

const AppraisalLevelsTab = ({ organogramId, organogramStatus, showAll, onCancelEdit }) => {
  const {
    apprLevels,
    apprOptions,
    loadingApprLevels,
    savingRow,
    handleSaveApprLevels,
  } = useApprLevelTabHandler(organogramId);

  const [appraisalRows, setAppraisalRows] = useState([]);
  const [effectiveFrom, setEffectiveFrom] = useState(null);

  const isLoading = loadingApprLevels || savingRow;
  const isEditing = !showAll && !isOrganogramReadOnly(organogramStatus);

  const columns = renderApprLevelColumns(getApprLevelColumns());

  useEffect(() => {
    setAppraisalRows(apprOptions.map((option) => ({
      appraiser: option.selected,
    })));
  }, [apprOptions]);

  const handleSave = async () => {
    const saved = await handleSaveApprLevels(appraisalRows, effectiveFrom);
    if (saved) {
      setAppraisalRows((current) => current.map((row) => ({ appraiser: row.appraiser })));
      setEffectiveFrom(null);
    }
  };

  const handleCancel = () => {
    setAppraisalRows((current) => current.map((row) => ({ appraiser: row.appraiser })));
    setEffectiveFrom(null);
    onCancelEdit?.();
  };

  const updateRow = (index, field, value) => {
    setAppraisalRows((current) => current.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  };

  return (
    <div>
      {isEditing && (
        <div className="mb-4">
          {appraisalRows.map((row, index) => (
            <div className="row align-items-end mb-3" key={index}>
              <div className="col-12">
                <label className="form-label">Appraisal Level {index + 1}</label>
                <SDLReactSelect
                  value={row.appraiser}
                  options={apprOptions}
                  onChange={(value) => updateRow(index, "appraiser", value)}
                  placeholder="Select Appraisal Level"
                  isLoading={loadingApprLevels}
                  isDisabled={isLoading}
                />
              </div>
            </div>
          ))}

          {apprOptions.length > 0 && (
            <div className="row mb-3">
              <div className="col-xl-5 col-lg-6 col-md-8">
                <label className="form-label">Effective From</label>
                <Calendar
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.value)}
                  dateFormat="dd-M-yy"
                  showIcon
                  className="w-100"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {apprOptions.length > 0 && (
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={appraisalRows.some((row) => !row.appraiser) || !effectiveFrom || isLoading}
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <DataTable
        value={apprLevels}
        loading={isLoading}
        dataKey="APPR_ORGID"
        size="small"
        emptyMessage="No appraisal levels defined for this organogram."
      >
        {columns}
      </DataTable>
    </div>
  );
};

export default AppraisalLevelsTab;