import { useState, useMemo, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getCalendarData } from "../../services/calendarService";
import "./SDLCalendar.css";

const SDLCalendar = ({
  /* =========================================================
     EXISTING STANDALONE CALLBACK
  ========================================================= */
  openModal,

  /* =========================================================
     CONTROLLED USAGE
  ========================================================= */
  value = null,
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
  className = "datepickers customdatePics",
}) => {
  /* =========================================================
     INTERNAL STATE
  ========================================================= */
  const [internalDate, setInternalDate] = useState(null);
  const [holidays, setHolidays] = useState([]);

  /* =========================================================
     DETERMINE DISPLAY MODE
  ========================================================= */
  const isInline = mode === "inline" || inline === true;

  /* =========================================================
     CONTROLLED / UNCONTROLLED
  ========================================================= */
  const isControlled = value !== null;
  const selectedDate = isControlled ? value : internalDate;

  /* =========================================================
     LOAD CALENDAR DATA
  ========================================================= */
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
  }, []);

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

    const classNameTxt =
      {
        W: "bg-danger-transparent",
        H: "bg-danger-transparent",
        O: "bg-warning-transparent",
      }[holiday?.type] || (isToday ? "bg-primary" : "bg-light");

    const content = (
      <span
        className={`badge ${classNameTxt}`}
        style={{ fontSize: "12px" }}
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
          : "sdl-calendar-wrapper"
      }
    >
      <Calendar
        className={isInline ? "sdl-inline-calendar" : className}
        value={selectedDate}
        onChange={handleChange}
        inline={isInline}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        dateFormat="dd-M-yy"
        dateTemplate={dateTemplate}
        showIcon={!isInline}
        placeholder={!isInline ? "dd-Mon-yyyy" : undefined}
        /* Mount popup overlay to body so PrimeReact calculates proper positions */
        appendTo={() => document.body}
        autoZIndex={true}
        baseZIndex={3000}
        panelClassName="sdl-calendar-panel"
      />
    </div>
  );
};

export default SDLCalendar;