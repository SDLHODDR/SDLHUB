import SDLFormLabel from "./SDLFormLabel";

const SDLFormField = ({ label, value, colClass = "col-md-6" }) => {
  return (
    <div className={colClass}>
      <div className="mb-3">
        <SDLFormLabel label={label} />
        <span className="ms-2">{value ?? ""}</span>
      </div>
    </div>
  );
};

export default SDLFormField;