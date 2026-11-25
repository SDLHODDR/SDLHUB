import SDLSearchSelect from './SDLSearchSelect'
import { searchEmployees } from '../../services/employeeDataService'

// Default option text: "NAME - CODE".
const defaultGetOption = row => ({
  value: row.EMP_CODE,
  label: `${row.NAME} - ${row.EMP_CODE}`
})

/*
 * Employee search field. Instead of loading every employee, the user types at least three
 * characters (code or any part of the name, words in any order) and presses Enter; the server
 * returns up to 50 matches (searchEmployees.php).
 *
 * Works like SDLReactSelect: `value` is the raw value and onChange(value, option) gets the raw
 * value plus the option ({ value, label, row }). getOption(row) builds an option from a result
 * row ({ ID, EMP_CODE, NAME, STATUS }); status='all' includes resigned / inactive employees.
 */
const EmployeeSearchSelect = ({
  getOption = defaultGetOption,
  status = 'active',
  placeholder = 'Search Employee',
  ...props
}) => {
  const search = async text => {
    const response = await searchEmployees({ q: text, status })
    if (!response?.status) throw new Error(response?.message || 'Unable to search employees.')
    return (response.data || []).map(row => ({ ...getOption(row), row }))
  }

  return (
    <SDLSearchSelect
      {...props}
      search={search}
      placeholder={placeholder}
      minLengthMessage='Type at least 3 letters of the name or code'
      noResultsMessage='No employees found'
    />
  )
}

export default EmployeeSearchSelect
