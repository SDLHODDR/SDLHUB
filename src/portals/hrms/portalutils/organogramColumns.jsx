import SDLActionButtons from "../../../components/SDLActionButtons";
import { getOrganogramActions } from "./organogramActions";

const serialBody = (rowData, options) =>
  options.rowIndex + 1 + (options.props.first || 0);

// Fill % shown alongside the raw counts — useful at a glance across 100+
// rows without doing the mental math each time. Guards div-by-zero for
// POSI_COUNT === 0 (seen in the data, e.g. ID 203).
const fillBody = (row) => {
  const posi = Number(row.POSI_COUNT) || 0;
  const fill = Number(row.FILL_COUNT) || 0;
  if (posi === 0) return `${fill} / 0`;
  const pct = Math.round((fill / posi) * 100);
  return `${fill} / ${posi} (${pct}%)`;
};

const statusBody = (row) => row.STATUSTXT || row.STATUS || "-";

// CONFIRM: getOrgonograms() may return more fields than ID/OPTIONS
// (company, department, designation, division, etc. individually).
// Right now OPTIONS is a single pre-concatenated description string
// (e.g. "234 - SDL - Vistaar - Marketing - Management Trainee"), which
// is all we have confirmed — split it into real columns once the raw
// field names are known.
export const organogramColumns = ({ onEdit }) => [
  // {
  //   header: "#",
  //   body: serialBody,
  //   style: { width: "70px", textAlign: "center" },
  // },
  {
    field: "ID",
    header: "ID",
    sortable: true,
    style: { width: "100px" },
  },
  // {
  //   field: "FINENT",
  //   header: "Fin Entity",
  //   sortable: true,
  //   style: { width: "90px" },
  // },
  {
    field: "DIVSN_TXT",
    header: "Division",
    sortable: true,
    style: { width: "120px" },
  },
  {
    field: "DEPT_TXT",
    header: "Department",
    sortable: true,
    style: { width: "150px" },
  },
  {
    field: "DESI_TXT",
    header: "Designation",
    sortable: true,
  },
  {
    key: "FILL_STATUS",
    header: "Filled / Positions",
    sortable: true,
    field: "FILL_COUNT", // enables PrimeReact's default sort on this column
    body: fillBody,
    style: { width: "150px" },
  },
  {
    key: "STATUS_DISPLAY",
    header: "Status",
    body: statusBody,
    style: { width: "90px" },
  },
  {
    field: "CHG_ON",
    header: "Last Changed",
    sortable: true,
    style: { width: "110px" },
  },
  {
    field: "OPTIONS",
    header: "Organogram",
    sortable: true,
  },
  {
    header: "Action",
    body: (row) => (
      <SDLActionButtons row={row} actions={getOrganogramActions({ onEdit })} />
    ),
    style: { width: "100px", textAlign: "center" },
  },
];