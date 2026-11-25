import { useState } from 'react'
import Select from 'react-select'
import { sdlSelectStyles } from '../../../../shared/components/form/SDLReactSelect'

/*
 * Search-on-Enter select. The user types at least `minLength` characters and presses Enter;
 * `search(text)` (a promise of options, e.g. an API call) supplies the matches. Until then the
 * menu says what to do ("Type at least 3 letters..." / "Press Enter to search").
 *
 * Works like SDLReactSelect: `value` is the raw value and onChange(value, option) gets the raw
 * value plus the chosen option. `valueOption` is the option to show for `value` when it was set
 * from outside the field (e.g. a row picked in a list), since it may not be in the results.
 */
const SDLSearchSelect = ({
  value,
  valueOption = null,
  onChange,
  search,
  minLength = 3,
  minLengthMessage = `Type at least ${minLength} letters`,
  noResultsMessage = 'No results found',
  placeholder = 'Search',
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  hasError = false,
  width = '100%'
}) => {
  const [inputValue, setInputValue] = useState('')
  const [searchedText, setSearchedText] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  // The chosen option, kept so it still shows after the results change.
  const [selected, setSelected] = useState(null)

  const text = inputValue.trim()
  const hasValue = value !== undefined && value !== null && value !== ''
  const matches = option => option && String(option.value) === String(value)
  const selectedOption = !hasValue
    ? null
    : matches(selected)
      ? selected
      : matches(valueOption)
        ? valueOption
        : null
  // Results are listed for the text they were searched with (or, with the box empty, the last
  // search is shown again); editing the text asks for Enter again.
  const showResults = searchedText !== '' && (text === '' || text === searchedText)

  const runSearch = async () => {
    setSearching(true)
    setSearchError('')
    try {
      setResults((await search(text)) || [])
    } catch (error) {
      setResults([])
      setSearchError(error?.message || 'Unable to search.')
    } finally {
      setSearchedText(text)
      setSearching(false)
    }
  }

  const handleKeyDown = event => {
    if (event.key !== 'Enter' || showResults) return
    // Enter starts the search (and must not submit a surrounding form).
    event.preventDefault()
    if (text.length >= minLength && !searching) runSearch()
  }

  const noOptionsMessage = () => {
    if (searching) return 'Searching...'
    if (text.length < minLength) return minLengthMessage
    if (!showResults) return 'Press Enter to search'
    return searchError || noResultsMessage
  }

  return (
    <div style={{ width, minWidth: width, maxWidth: width, flexShrink: 0 }}>
      <Select
        value={selectedOption}
        options={showResults ? results : []}
        inputValue={inputValue}
        // Cleared (as usual) when an option is picked or the field loses focus.
        onInputChange={next => setInputValue(next)}
        onChange={option => {
          setSelected(option || null)
          onChange?.(option ? option.value : '', option || null)
        }}
        onKeyDown={handleKeyDown}
        // The search already matched the text; don't filter the results again.
        filterOption={null}
        noOptionsMessage={noOptionsMessage}
        loadingMessage={() => 'Searching...'}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading || searching}
        styles={sdlSelectStyles(hasError)}
        menuPortalTarget={document.body}
        menuPosition='fixed'
        classNamePrefix='sdl-rs'
      />
    </div>
  )
}

export default SDLSearchSelect
