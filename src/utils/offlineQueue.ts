import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelRide, updateRideStatus } from "./api";
import { isOnline } from "./network";

type QueuedAction = {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
};

// Add action to queue
export const queueAction = async (
  type: string,
  payload: any
): Promise<string> => {
  const actionId = Date.now().toString();
  const action: QueuedAction = {
    id: actionId,
    type,
    payload,
    timestamp: Date.now(),
  };

  try {
    // Get existing queue
    const queueStr =
      (await AsyncStorage.getItem("offline_action_queue")) || "[]";
    const queue: QueuedAction[] = JSON.parse(queueStr);

    // Add new action
    queue.push(action);

    // Save updated queue
    await AsyncStorage.setItem("offline_action_queue", JSON.stringify(queue));

    return actionId;
  } catch (error) {
    console.error("Error adding to offline queue:", error);
    throw new Error("Failed to queue action for offline use");
  }
};

// Process queued actions when online
export const processQueue = async (): Promise<void> => {
  if (!(await isOnline())) {
    return; // Still offline
  }

  try {
    // Get queue
    const queueStr =
      (await AsyncStorage.getItem("offline_action_queue")) || "[]";
    const queue: QueuedAction[] = JSON.parse(queueStr);

    if (queue.length === 0) {
      return; // Nothing to process
    }

    // Process actions in order
    for (const action of queue) {
      try {
        switch (action.type) {
          case "CANCEL_RIDE":
            await cancelRide(action.payload.rideId);
            break;
          case "UPDATE_RIDE_STATUS":
            await updateRideStatus(
              action.payload.rideId,
              action.payload.status
            );
            break;
          // Add other action types as needed
        }
      } catch (error) {
        console.error(`Failed to process queued action ${action.id}:`, error);
        // Continue with next action
      }
    }

    // Clear queue after processing
    await AsyncStorage.setItem("offline_action_queue", "[]");
  } catch (error) {
    console.error("Error processing offline queue:", error);
  }
};
