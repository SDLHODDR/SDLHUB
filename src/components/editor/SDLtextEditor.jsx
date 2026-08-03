//import React from "react";
import { DefaultEditor } from "react-simple-wysiwyg";

const SDLtextEditor = ({ value, onChange, disabled, placeholder }) => {
  return (
    <DefaultEditor
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      containerProps={{ style: { minHeight: "120px" } }}
    />
  );
};

export default SDLtextEditor;