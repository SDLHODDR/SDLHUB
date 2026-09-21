import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Calendar } from "primereact/calendar";
import SDLReactSelect from "../../../components/SDLReactSelect";
import useApprLevelTabHandler from "./useApprLevelTabHandler";
import { getApprLevelColumns, renderApprLevelColumns } from "./apprLevelColumns";

const AppraisalLevelsTab = ({ organogramId, showAll }) => {
  const {
    apprLevels,
    apprOptions,
    loadingApprLevels,
    savingRow,
    handleAddApprLevel,
  } = useApprLevelTabHandler(organogramId);

  const [selectedAppraiser, setSelectedAppraiser] = useState(null);
  const [effectiveFrom, setEffectiveFrom] = useState(null);

  const isLoading = loadingApprLevels || savingRow;
  const isEditing = !showAll;

  const columns = renderApprLevelColumns(getApprLevelColumns());

  const handleAdd = async () => {
    const saved = await handleAddApprLevel(selectedAppraiser, effectiveFrom);
    if (saved) {
      setSelectedAppraiser(null);
      setEffectiveFrom(null);
    }
  };

  return (
    <div>
      {isEditing && (
        <div className="row align-items-end mb-3">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <label className="form-label">Add Appraisal Level</label>
            <SDLReactSelect
              value={selectedAppraiser}
              options={apprOptions}
              onChange={setSelectedAppraiser}
              placeholder="Select Appraiser"
              isLoading={loadingApprLevels}
              isDisabled={isLoading}
            />
          </div>
          <div className="col-xl-3 col-lg-4 col-md-5">
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
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={!selectedAppraiser || !effectiveFrom || isLoading}
            >
              Add
            </button>
          </div>
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