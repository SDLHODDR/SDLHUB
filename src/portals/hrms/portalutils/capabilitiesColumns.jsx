import SDLActionButtons from "../../../components/SDLActionButtons";
import { getCapabilitiesActions } from "./capabilitiesActions";

export const capabilitiesColumns = ({ handleEdit }) => [
  {
    header: "#",
    body: (row, meta) => meta.rowIndex + 1,
    style: { width: "70px", textAlign: "center" },
  },
  {
    header: "Skill",
    body: (row) => row.CAPA_CODE_DISPLAY,
    style: { width: "220px" },
  },
  {
    header: "Description",
    body: (row) => row.CAPA_DESC_DISPLAY,
  },
  {
    header: "Action",
    body: (row) => (
       <SDLActionButtons
        row={row}
        actions={getCapabilitiesActions({
          handleEdit,
        })}
      />
    ),
    style: { width: "100px", textAlign: "center" },
  },
];