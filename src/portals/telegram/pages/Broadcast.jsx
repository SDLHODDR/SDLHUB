import { useEffect, useState } from "react";

import BroadcastTable from "../components/BroadcastTable";
import CreateBroadcastModal from "../components/CreateBroadcastModal";

import {
  getBroadcasts,
  sendBroadcast,
} from "../services/telegramBroadcastService";

const SDLTelegramBroadcast = () => {
  const [broadcasts, setBroadcasts] = useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const loadBroadcasts = async () => {
    const res = await getBroadcasts();

    if (res?.success) {
      setBroadcasts(res.data);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handleSendBroadcast = async (
    payload
  ) => {
    const res = await sendBroadcast(payload);

    if (res?.success) {
      setBroadcasts((prev) => [
        {
          id: prev.length + 1,
          ...payload,
          status: "Sent",
          sent_on: "22 May 2026 12:00 PM",
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="telegram-page p-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            Broadcasts
          </h4>

          <p className="text-muted mb-0">
            Send telegram messages to groups
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Create Broadcast
        </button>
      </div>

      <div className="telegram-card card border-0 shadow-sm p-3">
        <BroadcastTable broadcasts={broadcasts} />
      </div>

      <CreateBroadcastModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSend={handleSendBroadcast}
      />

    </div>
  );
};

export default SDLTelegramBroadcast;