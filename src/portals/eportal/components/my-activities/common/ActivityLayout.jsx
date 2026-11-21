import SDLSearch from "../../../../../shared/components/datatable/SDLSearch";
import SDLReactSelect from "../../../../../shared/components/form/SDLReactSelect";
import ResetButton from "../../../../../shared/components/buttons/ResetButton";
import "../../../assets/css/activityLayout.css";

/*
 * Shared layout for the calendar + list pages under My Activities
 * (Leave, Outdoor Duty, Ticket Booking, Conference Room): calendar on the left,
 * title, filters and table on the right. Keep these pages on this so they stay identical.
 */

export const ActivitySectionHead = ({ title, subtitle, actions }) => (
  <div className="activity-section-head">
    <div>
      <h6 className="activity-section-title">{title}</h6>
      {subtitle && <small className="activity-section-subtitle">{subtitle}</small>}
    </div>
    {actions && <div className="activity-section-actions">{actions}</div>}
  </div>
);

export const ActivityPageLayout = ({ calendarTitle, calendarSubtitle, calendar, children, overlay }) => (
  <div className="card eportal-wide-card activity-page-card">
    {overlay}
    <div className="card-body">
      <div className="row">
        <div className="col-12 col-xl-3 border-end activity-calendar-column">
          <ActivitySectionHead title={calendarTitle} subtitle={calendarSubtitle} />
          {calendar}
        </div>

        <div className="col-12 col-xl-9 d-flex flex-column activity-list-column">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const ActivityFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  statusValue,
  onStatusChange,
  statusOptions = [],
  onReset,
  resetDisabled,
}) => (
  <div className="activity-filter-bar">
    <SDLSearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder={searchPlaceholder}
      className="mb-0 activity-filter-search"
    />

    <div className="activity-filter-status">
      <SDLReactSelect
        value={statusValue}
        options={statusOptions}
        onChange={(value) => onStatusChange(value || "ALL")}
        placeholder="Select Status"
        isClearable={false}
        width="220px"
      />
    </div>

    <ResetButton onClick={onReset} disabled={resetDisabled} />
  </div>
);
