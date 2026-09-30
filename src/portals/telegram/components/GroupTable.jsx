import React, { useState } from "react";
import Swal from "sweetalert2";

import ViewGroupModal from "./ViewGroupModal";
import GroupBroadcastModal from "./GroupBroadcastModal";
import { saveBroadCastMessage } from "../services/telegramService";

const GroupTable = ({
  groups,
  currentPage,
  setCurrentPage,
  total,
  isFilter,
}) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBroadcastClick = (group) => {
    setSelectedGroup(group);
    setShowBroadcastModal(true);
  };

  const handleSendBroadcast = async (payload) => {
    try {
      setLoading(true);

      const response = await saveBroadCastMessage(payload);

      if (response?.success) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.message || "Broadcast queued successfully.",
        });

        setShowBroadcastModal(false);
        setSelectedGroup(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.message || "Unable to save broadcast.",
        });
      }
    } catch (error) {
      console.error("Broadcast Error", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 telegram-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Created On</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {groups.map((group) => (
                  <tr key={group.ID}>
                    <td>
                      <div className="fw-semibold">
                        {group.TITLE}
                      </div>
                    </td>

                    <td>{group.member_count ?? 0}</td>

                    <td>
                      <span
                        className={`badge ${
                          group.ACTIVE_FLAG === "1"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {group.ACTIVE_FLAG === "1"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>{group.CREATED_ON}</td>

                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedGroup(group)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-sm btn-outline-success"
                          disabled={loading}
                          onClick={() =>
                            handleBroadcastClick(group)
                          }
                        >
                          Broadcast
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isFilter && (
            <div className="d-flex justify-content-end p-3">
              <button
                className="btn btn-sm btn-light me-2"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(currentPage - 1)
                }
              >
                Prev
              </button>

              <button
                className="btn btn-sm btn-light"
                disabled={
                  currentPage >= Math.ceil(total / 5)
                }
                onClick={() =>
                  setCurrentPage(currentPage + 1)
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <ViewGroupModal
        show={!!selectedGroup && !showBroadcastModal}
        group={selectedGroup}
        onClose={() => setSelectedGroup(null)}
      />

      <GroupBroadcastModal
        show={showBroadcastModal}
        group={selectedGroup}
        onClose={() => {
          setShowBroadcastModal(false);
          setSelectedGroup(null);
        }}
        onSend={handleSendBroadcast}
      />
    </>
  );
};

export default GroupTable;