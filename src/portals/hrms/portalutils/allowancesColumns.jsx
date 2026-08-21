import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import SDLTagSelect from "../../../components/SDLTagSelect"; // adjust path to actual location

export const getAllowancesColumns = ({
  allowanceOptions,
  loadingOptions,
  selectedAllowIds,
  setSelectedAllowIds,
  newEffecFrom,
  setNewEffecFrom,
}) => [
  {
    key: "NO",
    header: "No",
    style: { width: "5%" },
    body: (row, options) => (row.__isNew ? "" : options.rowIndex + 1),
  },
  {
    key: "ALLOWANCE",
    header: "Allowance",
    style: { width: "50%" },
    body: (row) =>
      row.__isNew ? (
        // <SDLTagSelect
        //   id="allowanceSelect"
        //   options={allowanceOptions}
        //   value={selectedAllowIds}
        //   onChange={setSelectedAllowIds}
        //   placeholder="Select Allowance"
        //   disabled={loadingOptions}
        // />
        <SDLTagSelect
          id="allowanceSelect"
          options={allowanceOptions}
          value={selectedAllowIds}
          onChange={setSelectedAllowIds}
          placeholder={loadingOptions ? "Loading..." : "Select Allowance"}
          disabled={false}
        />
      ) : (
        row.ALLOW_DESC ?? ""
      ),
  },
  {
    key: "FROM_DATE",
    header: "From Date",
    style: { width: "20%" },
    body: (row) =>
      row.__isNew ? (
        <Calendar
          value={newEffecFrom}
          onChange={(e) => setNewEffecFrom(e.value)}
          dateFormat="dd-M-yyyy"
          showIcon
          className="sdl-locations-calendar"
        />
      ) : (
        row.EFFEC_FROM || ""
      ),
  },
  {
    key: "TO_DATE",
    header: "To Date",
    style: { width: "20%" },
    body: (row) => (row.__isNew ? "" : row.EFFEC_TO || ""),
  },
];

export const renderAllowancesColumns = (
  columnDefs,
  { onSave, onCancel, onDelete, saving, deletingId }
) => [
  ...columnDefs.map((col) => (
    <Column
      key={col.key}
      field={col.key}
      header={col.header}
      style={col.style}
      body={col.body}
    />
  )),
  <Column
    key="__actions"
    header=""
    style={{ width: "5%" }}
    body={(row) => {
      if (row.__isNew) {
        return (
          <div className="d-flex gap-2 justify-content-center">
            <a
              title="Save"
              onClick={saving ? undefined : onSave}
              style={{ cursor: saving ? "not-allowed" : "pointer" }}
            >
              <i className="fas fa-check text-success icon-md" />
            </a>
            <a
              title="Cancel"
              onClick={saving ? undefined : onCancel}
              style={{ cursor: saving ? "not-allowed" : "pointer" }}
            >
              <i className="fas fa-times text-danger icon-md" />
            </a>
          </div>
        );
      }
      // legacy: delete only shown when EFFEC_TO is blank
      if (String(row.EFFEC_TO || "").trim() === "") {
        return (
          <a
            title="Delete"
            onClick={deletingId === row.ID ? undefined : () => onDelete(row)}
            style={{ cursor: deletingId === row.ID ? "not-allowed" : "pointer" }}
          >
            <i className="fas fa-trash text-info icon-md" />
          </a>
        );
      }
      return null;
    }}
  />,
];