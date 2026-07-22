// SDLCalendar.jsx
import { useState, useMemo, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getCalendarData } from "../../services/calendarService";
import Swal from "sweetalert2";

const SDLCalendar = ({ openModal }) => {
  const [date, setDate] = useState(null);
  const [holidays, setHolidays] = useState([]);

  // Load calendar data
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const response = await getCalendarData();
        console.log("Calendar Data:", response); // debug

        const normalized = response.map((item) => ({
          date: new Date(item.date),
          dateStr: item.date, // already YYYY-MM-DD
          type: item.HOL_TYPE, // H, W, O
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
  const renderTooltip = (text) => (props) => (
    <Tooltip id="tooltip-holiday" {...props}>
      {text}
    </Tooltip>
  );

  // O(1) lookup map
  const holidayMap = useMemo(() => {
    const map = {};
    holidays.forEach((h) => {
      map[h.dateStr] = h;
    });
    return map;
  }, [holidays]);

  // Helper: date → key
  const getKey = (date) => {
    return `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;
  };

  // Disable logic (ONLY H & W)
  const isDisabledDate = (holiday) => {
    return holiday?.type === "H" || holiday?.type === "W";
  };

  // Calendar cell renderer
  const dateTemplate = (date) => {
    const key = getKey(date);
    const holiday = holidayMap[key];
    const isDisabled = isDisabledDate(holiday);

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

    const classNameTxt = {
      W: "bg-danger-transparent",
      H: "bg-danger-transparent",
      O: "bg-warning-transparent",
    }[holiday?.type] || (isToday ? "bg-primary" : "bg-light");

    //console.log("=======bgGolor and textColor ========", bgColor, textColor);
    //let checkToday = (isToday) ? "" : classNameTxt;
    
    const content = (
      <span className={`badge ${classNameTxt}`}
        style={{
          fontSize: "12px"
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

    const key = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(
      selectedDate.getDate()
    ).padStart(2, "0")}`;

    const holiday = holidayMap[key];

    // block weekends & holidays
    if (holiday && (holiday.type === "H" || holiday.type === "W")) {
      return;
    }

    setDate(selectedDate);

    openModal({
      mode: "create",
      modalDate: selectedDate,
    });
  };

  return (
    <Calendar
      className="datepickers customdatePics mb-4"
      value={date}
      onChange={handleChange}
      inline
      dateTemplate={dateTemplate}
    />
  );
};

export default SDLCalendar;