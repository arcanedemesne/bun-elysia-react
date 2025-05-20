import { Alert, ApiError } from "..";

const emitEvent = (eventListenerName: string, detail: Alert) => {
  document.dispatchEvent(
    new CustomEvent(eventListenerName, {
      detail,
      bubbles: true, // Optional: Should the event bubble up the DOM tree? (default: false)
      cancelable: false, // Optional: Can the event's default action be prevented? (default: false)
    }),
  );
};

export const messageBarEventListenerName = "message-bar-event-listener";
export const showMessage = (detail: Alert) => {
  emitEvent(messageBarEventListenerName, detail);
};

export const toastEventListenerName = "toast-event-listener";
export const showToast = (detail: Alert) => {
  emitEvent(toastEventListenerName, detail);
};

export const showApiError = (apiError: ApiError) => {
  emitEvent(messageBarEventListenerName, {
    message: `(${apiError.status}) ${apiError.statusText} - ${apiError.message}`,
    type: "error",
  });
};
