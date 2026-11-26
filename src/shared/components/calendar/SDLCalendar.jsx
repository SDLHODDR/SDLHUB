import { useState, useMemo, useEffect, useId } from "react";
import { Calendar } from "primereact/calendar";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getCalendarData } from "../../services/calendarService";
import "./SDLCalendar.css";

const SDLCalendar = ({
  /* Field id / name for the date input (an id is generated when neither is given) */
  id,
  name,

  /* =========================================================
     EXISTING STANDALONE CALLBACK
  ========================================================= */
  openModal,

  /* =========================================================
     CONTROLLED USAGE
  ========================================================= */
  value,
  onChange,

  /* =========================================================
     CALENDAR MODE
  ========================================================= */
  mode = "picker",

  /* =========================================================
     BACKWARD COMPATIBILITY
  ========================================================= */
  inline = false,

  /* =========================================================
     CALENDAR OPTIONS
  ========================================================= */
  disabled = false,
  minDate,
  maxDate,
  allowAllDates = false,
  // false: skip the holiday calendar (an employee API), e.g. on the public careers portal.
  showHolidays = true,
  dateFormat = "dd-M-yy",
  locale,
  appendTo = () => document.body,
  baseZIndex = 3000,
  wrapperClassName = "",
  inputClassName = "",
  className = "datepickers customdatePics",
}) => {
  /* =========================================================
     INTERNAL STATE
  ========================================================= */
  const generatedId = useId();
  const [internalDate, setInternalDate] = useState(null);
  const [holidays, setHolidays] = useState([]);

  /* =========================================================
     DETERMINE DISPLAY MODE
  ========================================================= */
  const isInline = mode === "inline" || inline === true;

  /* =========================================================
     CONTROLLED / UNCONTROLLED
  ========================================================= */
  // A picker driven by its parent (value/onChange) must show exactly the parent's
  // value, including an empty one after a form reset. Only the inline calendars,
  // which pass neither, keep their own selected date.
  const isControlled = value !== undefined || typeof onChange === "function";
  const selectedDate = isControlled ? value ?? null : internalDate;

  /* =========================================================
     MONTH SHOWN WHEN THE PICKER OPENS
  ========================================================= */
  // PrimeReact keeps the last month it showed, even after the value is cleared, so a
  // form opened after editing an old record would start on that old month. Each time
  // the popup opens it starts on the selected date, else today, kept within min/max.
  const openingMonth = () => {
    const picked = selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime());
    let date = picked ? new Date(selectedDate) : new Date();
    if (minDate instanceof Date && date < minDate) date = new Date(minDate);
    if (maxDate instanceof Date && date > maxDate) date = new Date(maxDate);
    return date;
  };
  const [viewDate, setViewDate] = useState(openingMonth);

  /* =========================================================
     LOAD CALENDAR DATA
  ========================================================= */
  useEffect(() => {
    if (!showHolidays) return undefined;
    let mounted = true;

    const loadCalendar = async () => {
      try {
        const response = await getCalendarData();

        if (!mounted) return;

        const calendarData = Array.isArray(response?.data)
          ? response.data
          : [];

        const normalized = calendarData
          .filter((item) => item?.date)
          .map((item) => {
            const dateString = String(item.date).substring(0, 10);
            const parts = dateString.split("-");

            let dateObj = new Date(item.date);

            if (parts.length === 3 && parts[0].length === 4) {
              const year = Number(parts[0]);
              const month = Number(parts[1]) - 1;
              const day = Number(parts[2]);

              dateObj = new Date(year, month, day);
            }

            return {
              date: dateObj,
              dateStr: dateString,
              type: item.HOL_TYPE,
              descr: item.title,
              bgColor: item.HOL_TYPE_COLOR,
              textColor: item.HOL_TYPE_TEXT_COLOR,
            };
          });

        setHolidays(normalized);
      } catch (error) {
        console.error("SDLCalendar load error:", error);
        if (mounted) {
          setHolidays([]);
        }
      }
    };

    loadCalendar();

    return () => {
      mounted = false;
    };
  }, [showHolidays]);

  /* =========================================================
     TOOLTIP
  ========================================================= */
  const renderTooltip = (text) => (props) => (
    <Tooltip
      id="tooltip-holiday"
      {...props}
      className="sdl-calendar-tooltip"
    >
      {text}
    </Tooltip>
  );

  /* =========================================================
     HOLIDAY MAP
  ========================================================= */
  const holidayMap = useMemo(() => {
    const map = {};
    holidays.forEach((holiday) => {
      if (holiday?.dateStr) {
        map[holiday.dateStr] = holiday;
      }
    });
    return map;
  }, [holidays]);

  /* =========================================================
     PRIMEREACT DATE -> YYYY-MM-DD
  ========================================================= */
  const getDateKey = (date) => {
    if (!date) return "";
    return `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;
  };

  /* =========================================================
     JS DATE -> YYYY-MM-DD
  ========================================================= */
  const formatDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "";
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  /* =========================================================
     CALENDAR DATE TEMPLATE
  ========================================================= */
  const dateTemplate = (date) => {
    const key = getDateKey(date);
    const holiday = holidayMap[key];

    let tooltipText = null;

    if (holiday?.type === "W") {
      tooltipText = `Weekend: ${holiday.descr || ""}`;
    } else if (holiday?.type === "H") {
      tooltipText = `Holiday: ${holiday.descr || ""}`;
    } else if (holiday?.type === "O") {
      tooltipText = `Optional Holiday: ${holiday.descr || ""}`;
    }

    const today = new Date();
    const isToday =
      date.day === today.getDate() &&
      date.month === today.getMonth() &&
      date.year === today.getFullYear();

    const content = (
      <span
        className={`sdl-calendar-day${holiday?.type === "W" ? " sdl-calendar-day-weekend" : ""}${holiday?.type === "H" ? " sdl-calendar-day-holiday" : ""}${holiday?.type === "O" ? " sdl-calendar-day-optional" : ""}${isToday ? " sdl-calendar-day-today" : ""}`}
      >
        {date.day}
      </span>
    );

    if (!tooltipText) {
      return content;
    }

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

  /* =========================================================
     HANDLE DATE SELECTION
  ========================================================= */
  const handleChange = (event) => {
    const selected = event?.value;

    /* CLEAR DATE */
    if (!selected) {
      if (!isControlled) {
        setInternalDate(null);
      }
      if (typeof onChange === "function") {
        onChange(null);
      }
      return;
    }

    /* VALIDATE DATE */
    if (!(selected instanceof Date) || Number.isNaN(selected.getTime())) {
      console.error("SDLCalendar received invalid date:", selected);
      return;
    }

    /* HOLIDAY VALIDATION */
    const key = formatDateKey(selected);
    const holiday = holidayMap[key];

    if (!allowAllDates && holiday && (holiday.type === "H" || holiday.type === "W")) {
      return;
    }

    /* UPDATE STATE */
    if (!isControlled) {
      setInternalDate(selected);
    }

    if (typeof onChange === "function") {
      onChange(selected);
    }

    // Only fire openModal when in standalone/inline main-dashboard view
    if (isInline && typeof openModal === "function") {
      openModal({
        mode: "create",
        modalDate: selected,
      });
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div
      className={
        isInline
          ? "sdl-calendar-wrapper sdl-calendar-inline-wrapper"
          : `sdl-calendar-wrapper ${wrapperClassName}`.trim()
      }
    >
      <Calendar
        className={isInline ? "sdl-inline-calendar" : className}
        inputClassName={inputClassName}
        inputId={id || generatedId}
        name={name}
        value={selectedDate}
        onChange={handleChange}
        inline={isInline}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        viewDate={isInline ? undefined : viewDate}
        onViewDateChange={isInline ? undefined : (event) => setViewDate(event.value)}
        onShow={isInline ? undefined : () => setViewDate(openingMonth())}
        dateFormat={dateFormat}
        locale={locale}
        dateTemplate={dateTemplate}
        showIcon={!isInline}
        placeholder={!isInline ? "dd-Mon-yyyy" : undefined}
        /* Mount popup overlay to body so PrimeReact calculates proper positions */
        appendTo={appendTo}
        autoZIndex={true}
        baseZIndex={baseZIndex}
        panelClassName="sdl-calendar-panel"
      />
      {/* Key for the day colours (inline calendars only). */}
      {isInline && showHolidays && (
        <div className="sdl-calendar-legend" aria-hidden="true">
          <span><i className="sdl-legend-dot sdl-legend-weekend" />Weekend</span>
          <span><i className="sdl-legend-dot sdl-legend-holiday" />Holiday</span>
          <span><i className="sdl-legend-dot sdl-legend-optional" />Optional Holiday</span>
        </div>
      )}
    </div>
  );
};

export default SDLCalendar;
