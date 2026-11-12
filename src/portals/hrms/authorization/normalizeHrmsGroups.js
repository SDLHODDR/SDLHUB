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

// Groups shown in the pending task list (API key -> label). Their order comes
// from HR_TASK_MASTER.DISP_SEQ; this list order only breaks ties.
const GROUP_ORDER = [
  { apiKey: "Recruitment", label: "Recruitment" },
  { apiKey: "Joining", label: "Joining" },
  { apiKey: "TenureChange", legacyApiKey: "Tenure Change", label: "Tenure Change" },
  { apiKey: "Exit", label: "Exit" },
  { apiKey: "Organogram", label: "Organogram" },
  { apiKey: "Masters", label: "Masters" },
];

// Tasks without a display sequence go last.
const sequenceOf = (value) =>
  value === null || value === undefined || value === "" || Number.isNaN(Number(value))
    ? Number.POSITIVE_INFINITY
    : Number(value);

/*
 * Pending task list: tasks are ordered by their display sequence
 * (HR_TASK_MASTER.DISP_SEQ), and each group by its first task's sequence.
 */
export const normalizeHrmsGroups = (apiResponse = {}) =>
  GROUP_ORDER
    .map((group, index) => ({ ...group, index }))
    .filter(({ apiKey, legacyApiKey }) => apiResponse[apiKey] || apiResponse[legacyApiKey])
    .map(({ apiKey, legacyApiKey, label, index }) => {
      const tasks = (apiResponse[apiKey] || apiResponse[legacyApiKey] || [])
        .map((task, position) => ({ task, position, sequence: sequenceOf(task.DISP_SEQ) }))
        // Stable: equal sequences keep the API order.
        .sort((a, b) => a.sequence - b.sequence || a.position - b.position);

      return {
        key: GROUP_KEY_MAP[apiKey] || apiKey.toLowerCase().replace(/\s+/g, "-"),
        label,
        index,
        sequence: tasks.length ? tasks[0].sequence : Number.POSITIVE_INFINITY,
        items: tasks.map(({ task }) => ({
          label: task.TASK_DESC,
          count: task.CNT,
          href: `/hrms/taskauthorization/${GROUP_KEY_MAP1[apiKey]}/${task.TASK_ID}`,
        })),
      };
    })
    .sort((a, b) => a.sequence - b.sequence || a.index - b.index)
    .map(({ key, label, items }) => ({ key, label, items }));
