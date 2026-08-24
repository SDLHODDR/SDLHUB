// SDLCalendar.jsx
import { useState, useMemo, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getCalendarData } from "../../services/calendarService";
import "./SDLCalendar.css";

const SDLCalendar = ({
  // Existing standalone calendar usage
  openModal,

  // Controlled usage
  value = null,
  onChange,

  // Calendar options
  inline = false,
  disabled = false,
  minDate,
  maxDate,

  // Existing option
  allowAllDates = false,

  className = "datepickers customdatePics",
}) => {
  const [internalDate, setInternalDate] = useState(null);
  const [holidays, setHolidays] = useState([]);

  /*
   * IMPORTANT:
   *
   * value !== null
   *    => controlled component
   *
   * value === null
   *    => standalone/internal component
   */
  const isControlled = value !== null;

  const selectedDate = isControlled ? value : internalDate;

  // ---------------------------------------------------------
  // Load calendar data
  // ---------------------------------------------------------
  useEffect(() => {
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
            const dateObj = new Date(item.date);

            return {
              date: dateObj,
              dateStr: item.date
                ? String(item.date).substring(0, 10)
                : "",
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
  }, []);

  // ---------------------------------------------------------
  // Tooltip
  // ---------------------------------------------------------
  const renderTooltip = (text) => (props) => (
    <Tooltip
      id="tooltip-holiday"
      {...props}
      className="sdl-calendar-tooltip"
    >
      {text}
    </Tooltip>
  );

  // ---------------------------------------------------------
  // Holiday lookup
  // ---------------------------------------------------------
  const holidayMap = useMemo(() => {
    const map = {};

    holidays.forEach((holiday) => {
      if (holiday?.dateStr) {
        map[holiday.dateStr] = holiday;
      }
    });

    return map;
  }, [holidays]);

  // ---------------------------------------------------------
  // PrimeReact date object -> YYYY-MM-DD
  // ---------------------------------------------------------
  const getDateKey = (date) => {
    if (!date) return "";

    return `${date.year}-${String(date.month + 1).padStart(
      2,
      "0",
    )}-${String(date.day).padStart(2, "0")}`;
  };

  // ---------------------------------------------------------
  // JS Date -> YYYY-MM-DD
  // ---------------------------------------------------------
  const formatDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "";
    }

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // ---------------------------------------------------------
  // Calendar cell
  // ---------------------------------------------------------
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

    if (!tooltipText) {
      return content;
    }

    return (
      <OverlayTrigger
        placement="top"
        overlay={renderTooltip(tooltipText)}
        container={document.body}
      >
        <span style={{ display: "inline-block" }}>
          {content}
        </span>
      </OverlayTrigger>
    );
  };

  // ---------------------------------------------------------
  // Handle selection
  // ---------------------------------------------------------
  const handleChange = (event) => {
    const selected = event?.value;

    if (!selected) {
      if (!isControlled) {
        setInternalDate(null);
      }

      if (typeof onChange === "function") {
        onChange(null);
      }

      return;
    }

    if (
      !(selected instanceof Date) ||
      Number.isNaN(selected.getTime())
    ) {
      console.error(
        "SDLCalendar received invalid date:",
        selected,
      );
      return;
    }

    const key = formatDateKey(selected);
    const holiday = holidayMap[key];

    /*
     * Existing behavior:
     * When allowAllDates = false,
     * weekends and holidays are blocked.
     *
     * When allowAllDates = true,
     * all dates can be selected.
     */
    if (
      !allowAllDates &&
      holiday &&
      (holiday.type === "H" || holiday.type === "W")
    ) {
      return;
    }

    // -------------------------------------------------------
    // Controlled usage
    // -------------------------------------------------------
    if (isControlled) {
      if (typeof onChange === "function") {
        onChange(selected);
      }

      return;
    }

    // -------------------------------------------------------
    // Existing standalone usage
    // -------------------------------------------------------
    setInternalDate(selected);

    if (typeof onChange === "function") {
      onChange(selected);
    }

    if (typeof openModal === "function") {
      openModal({
        mode: "create",
        modalDate: selected,
      });
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