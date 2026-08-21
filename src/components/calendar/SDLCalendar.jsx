// SDLCalendar.jsx
import { useState, useMemo, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getCalendarData } from "../../services/calendarService";
import "./SDLCalendar.css";

const SDLCalendar = ({
  // Existing calendar-page usage
  openModal,

  // New controlled/form usage
  value = null,
  onChange,

  // Calendar options
  inline = false,
  disabled = false,
  minDate,
  maxDate,

  // NEW
  allowAllDates = false,

  className = "datepickers customdatePics",
}) => {
  const [internalDate, setInternalDate] = useState(null);
  const [holidays, setHolidays] = useState([]);

  /*
   * If value is supplied, SDLCalendar works as a controlled component.
   * Otherwise it maintains its own internal date.
   */
  const selectedDate = value !== null ? value : internalDate;

  // Load calendar data
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const response = await getCalendarData();

        const normalized = (response?.data || []).map((item) => ({
          date: new Date(item.date),
          dateStr: item.date,
          type: item.HOL_TYPE,
          descr: item.title,
          bgColor: item.HOL_TYPE_COLOR,
          textColor: item.HOL_TYPE_TEXT_COLOR,
        }));

        setHolidays(normalized);
      } catch (err) {
        console.error("Calendar load error:", err);
      }
    };

    loadCalendar();
  }, []);

  // Tooltip renderer
  /*const renderTooltip = (text) => (props) => (
    <Tooltip id="tooltip-holiday" {...props}>
      {text}
    </Tooltip>
  );*/

  const renderTooltip = text => props => (
  <Tooltip
    id='tooltip-holiday'
    {...props}
    className='sdl-calendar-tooltip'
  >
    {text}
  </Tooltip>
)

  // O(1) lookup map
  const holidayMap = useMemo(() => {
    const map = {};

    holidays.forEach((h) => {
      map[h.dateStr] = h;
    });

    return map;
  }, [holidays]);

  // Helper: date → YYYY-MM-DD
  const getKey = (date) => {
    return `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;
  };

  // Calendar cell renderer
  const dateTemplate = (date) => {
    const key = getKey(date);
    const holiday = holidayMap[key];

    let tooltipText = null;

    if (holiday?.type === "W") {
      tooltipText = `Weekend: ${holiday.descr}`;
    } else if (holiday?.type === "H") {
      tooltipText = `Holiday: ${holiday.descr}`;
    } else if (holiday?.type === "O") {
      tooltipText = `Optional Holiday: ${holiday.descr}`;
    }

    const today = new Date();

    const isToday =
      date.day === today.getDate() &&
      date.month === today.getMonth() &&
      date.year === today.getFullYear();

    const classNameTxt =
      {
        W: "bg-danger-transparent",
        H: "bg-danger-transparent",
        O: "bg-warning-transparent",
      }[holiday?.type] || (isToday ? "bg-primary" : "bg-light");

    const content = (
      <span
        className={`badge ${classNameTxt}`}
        style={{
          fontSize: "12px",
        }}
      >
        {date.day}
      </span>
    );

    if (!tooltipText) return content;

    return (
      <OverlayTrigger
        placement="top"
        overlay={renderTooltip(tooltipText)}
        container={document.body}
      >
        <span style={{ display: "inline-block" }}>{content}</span>
      </OverlayTrigger>
    );
  };

  // Handle selection
  const handleChange = (e) => {
    const selectedDate = e.value;

    if (!selectedDate) {
      if (value === null) {
        setInternalDate(null);
      }

      onChange?.(null);
      return;
    }

    const key = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    const holiday = holidayMap[key];

    // Block weekends & holidays only when allowAllDates is false
    if (
      !allowAllDates &&
      holiday &&
      (holiday.type === "H" || holiday.type === "W")
    ) {
      return;
    }

    // Controlled component
    if (value !== null) {
      onChange?.(selectedDate);
    } else {
      // Existing standalone calendar usage
      setInternalDate(selectedDate);

      if (openModal) {
        openModal({
          mode: "create",
          modalDate: selectedDate,
        });
      }

      onChange?.(selectedDate);
    }
  };

 return (
  <div className="sdl-calendar-wrapper">
    <Calendar
      className={className}
      value={selectedDate}
      onChange={handleChange}
      inline={inline}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      dateFormat="dd-M-yy"
      dateTemplate={dateTemplate}
      showIcon={!inline}
      placeholder={!inline ? "dd-Mon-yyyy" : undefined}
    />
  </div>
);
};

export default SDLCalendar;