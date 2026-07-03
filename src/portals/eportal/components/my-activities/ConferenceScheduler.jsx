import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

/* Convert 10-Mar-2026 → 2026-03-10 */
const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  if (isNaN(date)) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const ConferenceScheduler = ({ bookings = [] }) => {
  const events = bookings
  .filter(
    (b) =>
      b.STATUS !== "X" &&
      b.STATUS !== "D"
  )
  .map((b) => {
    const date = formatDate(b.DT);

    let color = "#6c757d";

    if (b.STATUS === "A") color = "#28a745";
    if (b.STATUS === "N") color = "#ffc107";
    if (b.STATUS === "T") color = "#0dcaf0";
    if (b.STATUS === "R") color = "#dc3545";

    return {
      id: b.ID,
      title: `${b.ROOM_LABEL} | ${b.BOOK_BY_NAME}`,
      start: `${date}T${b.STARTTIME}`,
      end: `${date}T${b.ENDTIME}`,
      backgroundColor: color,
      borderColor: color,

      extendedProps: {
        room: b.ROOM_LABEL,
        bookedBy: b.BOOK_BY_NAME,
        startTime: b.STARTTIME,
        endTime: b.ENDTIME,
        status: b.STATUS,
      },
    };
  });

  return (
    <div className="card">
      <div className="card-body">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin
          ]}
          initialView="timeGridDay"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          height="auto"
          events={events}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          nowIndicator={true}

          /* Native tooltip */
          eventDidMount={(info) => {
            const event = info.event.extendedProps;

            info.el.setAttribute(
              "title",
              `Room: ${event.room}
Booked By: ${event.bookedBy}
Start: ${event.startTime}
End: ${event.endTime}
Status: ${event.status}`
            );
          }}
        />
      </div>
    </div>
  );
};

export default ConferenceScheduler;
