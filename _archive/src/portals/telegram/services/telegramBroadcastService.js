import { broadcasts } from "./broadcastMockData";

export const getBroadcasts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: broadcasts,
      });
    }, 500);
  });
};

export const sendBroadcast = async (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Broadcast sent successfully",
        data: payload,
      });
    }, 1000);
  });
};