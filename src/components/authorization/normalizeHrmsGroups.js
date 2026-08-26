// normalizeHrmsGroups.js

const GROUP_KEY_MAP = {
  Recruitment: "recruitment",
  Joining: "joining",
  "Tenure Change": "tenure-change",
  Exit: "exit",
  Organogram: "organogram",
};
const GROUP_KEY_MAP1 = {
  Recruitment: "R",
  Joining: "J",
  TenureChange: "T",
  Exit: "E",
  Appraisal: "A",
  Organogram: "O",
};

// Preserves your desired display order regardless of what order the API returns groups in
const GROUP_ORDER = ["Recruitment", "Joining", "Tenure Change", "Exit", "Organogram"];

export const normalizeHrmsGroups = (apiResponse = {}) =>
  GROUP_ORDER
    .filter((label) => apiResponse[label]) // only include groups the API actually returned
    .map((label) => ({
      key: GROUP_KEY_MAP[label] || label.toLowerCase().replace(/\s+/g, "-"),
      label,
      items: (apiResponse[label] || []).map((task) => ({
        label: task.TASK_DESC,
        count: task.CNT,
        href: `/hrms/taskauthorization/${GROUP_KEY_MAP1[label]}/${task.TASK_ID}`,
      })),
    }));