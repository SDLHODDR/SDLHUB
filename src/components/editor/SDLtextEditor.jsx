// //import React from "react";
// import { DefaultEditor } from "react-simple-wysiwyg";

// const SDLtextEditor = ({ value, onChange, disabled, placeholder }) => {
//   return (
//     <DefaultEditor
//       value={value || ""}
//       onChange={onChange}
//       disabled={disabled}
//       placeholder={placeholder}
//       containerProps={{ style: { minHeight: "120px" } }}
//     />
//   );
// };

// export default SDLtextEditor;

//import React from "react";
import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  BtnNumberedList,
  BtnBulletList,
  BtnLink,
  BtnClearFormatting,
  BtnUndo,
  BtnRedo,
  BtnStyles,
  HtmlButton,
  Separator,
} from "react-simple-wysiwyg";

// Map of available tools -> component. Add more here if the library supports them.
const TOOL_MAP = {
  undo: BtnUndo,
  redo: BtnRedo,
  bold: BtnBold,
  italic: BtnItalic,
  underline: BtnUnderline,
  strikethrough: BtnStrikeThrough,
  numberedList: BtnNumberedList,
  bulletList: BtnBulletList,
  link: BtnLink,
  clearFormatting: BtnClearFormatting,
  htmlMode: HtmlButton,
  styles: BtnStyles,
  separator: Separator,
};

// Default toolbar: everything except undo, redo, htmlMode, clearFormatting
const DEFAULT_TOOLBAR_CONFIG = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "separator",
  "numberedList",
  "bulletList",
  "separator",
  "link",
  "separator",
  "styles",
];

const SDLtextEditor = ({
  value,
  onChange,
  disabled,
  placeholder,
  toolbarConfig = DEFAULT_TOOLBAR_CONFIG,
  containerProps = { style: { minHeight: "120px" } },
}) => {
  return (
    <EditorProvider>
      <Editor
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        containerProps={containerProps}
      >
        <Toolbar>
          {toolbarConfig.map((tool, index) => {
            const ToolComponent = TOOL_MAP[tool];
            if (!ToolComponent) return null;
            return <ToolComponent key={`${tool}-${index}`} />;
          })}
        </Toolbar>
      </Editor>
    </EditorProvider>
  );
};

export default SDLtextEditor;