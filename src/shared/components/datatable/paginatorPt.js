/*
 * PrimeReact's "rows per page" dropdown renders a hidden <select> and a
 * hidden <input> with no id or name, which the browser reports as
 * "A form field element should have an id or name attribute".
 * These pass-through objects give both a name.
 *
 *   <DataTable pt={DATATABLE_PT} ... />
 *   <Paginator pt={PAGINATOR_PT} ... />
 */
const ROWS_PER_PAGE_PT = {
  select: { name: "rowsPerPage" },
  input: { name: "rowsPerPage" },
};

export const PAGINATOR_PT = { RPPDropdown: ROWS_PER_PAGE_PT };

export const DATATABLE_PT = { paginator: PAGINATOR_PT };
