/* Number formatting for the appraisal follow-up task modals. */

export const appraisalInr = value =>
  value === null || value === undefined || value === '' || Number.isNaN(Number(value))
    ? '-'
    : Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })
