import { titleCase } from "../../utils/commonUtils";

const SDLFormLabel = ({ label, className = "fw-semibold", htmlFor }) => {
  return (
    <label className={className} htmlFor={htmlFor}>
      {titleCase(label)} :
    </label>
  );
};

export default SDLFormLabel;