// normalizeHrmsGroups.js

const GROUP_KEY_MAP = {
  Recruitment: "recruitment",
  Joining: "joining",
  TenureChange: "tenure-change",
  Exit: "exit",
  Organogram: "organogram",
  Masters: "masters",
};

const GROUP_KEY_MAP1 = {
  Recruitment: "R",
  Joining: "J",
  TenureChange: "T",
  Exit: "E",
  Appraisal: "A",
  Organogram: "O",
  Masters: "M"
};

// Preserves display order while allowing API keys to differ from their labels.
const GROUP_ORDER = [
  { apiKey: "Recruitment", label: "Recruitment" },
  { apiKey: "Joining", label: "Joining" },
  { apiKey: "TenureChange", legacyApiKey: "Tenure Change", label: "Tenure Change" },
  { apiKey: "Exit", label: "Exit" },
  { apiKey: "Organogram", label: "Organogram" },
  { apiKey: "Masters", label: "Masters" },
];

export const normalizeHrmsGroups = (apiResponse = {}) =>
  GROUP_ORDER
    .filter(({ apiKey, legacyApiKey }) => apiResponse[apiKey] || apiResponse[legacyApiKey])
    .map(({ apiKey, legacyApiKey, label }) => ({
      key: GROUP_KEY_MAP[apiKey] || apiKey.toLowerCase().replace(/\s+/g, "-"),
      label,
      items: (apiResponse[apiKey] || apiResponse[legacyApiKey] || []).map((task) => ({
        label: task.TASK_DESC,
        count: task.CNT,
        href: `/hrms/taskauthorization/${GROUP_KEY_MAP1[apiKey]}/${task.TASK_ID}`,
      })),
    }));