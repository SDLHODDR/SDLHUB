const SDLSearch = ({
    value = "",
    onChange,
    placeholder = "Search...",
    className = "",
    disabled = false,
    name,
    id,
    autoFocus = false,
    onKeyDown,
    style = {},
}) => (
     <div className={`search-set ${className}`} style={style}>
        <div className="search-input position-relative">
            <span className="btn-searchset">
                <i className="ti ti-search"></i>
            </span>

            <input
                id={id}
                name={name}
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                autoFocus={autoFocus}
                onKeyDown={onKeyDown}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    </div>
);

export default SDLSearch;