import React, { useEffect, useState } from "react";
import PrimeDataTable from "../../data-table";

const RoomRequestsTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchRoomRequests();
  }, []);

  const fetchRoomRequests = async () => {
    try {
      const response = await fetch("/api/room-requests");
      const result = await response.json();

      setData(result || []);
    } catch (error) {
      console.error(error);
    }
  };

  const approve = async (id) => {
    console.log("Approve Room:", id);
    fetchRoomRequests();
  };

  const reject = async (id) => {
    console.log("Reject Room:", id);
    fetchRoomRequests();
  };

  const columns = [
    { field: "empName", header: "Employee" },
    { field: "roomName", header: "Room" },
    { field: "date", header: "Date" },
    { field: "time", header: "Time" },
    { field: "status", header: "Status" },
    {
      field: "action",
      header: "Action",
      body: (row) => (
        <>
          <button className="btn btn-success btn-sm me-2" onClick={() => approve(row.id)}>
            Approve
          </button>

          <button className="btn btn-danger btn-sm" onClick={() => reject(row.id)}>
            Reject
          </button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h5>Conference Room Requests</h5>

      <PrimeDataTable data={data} columns={columns} />
    </div>
  );
};

export default RoomRequestsTable;