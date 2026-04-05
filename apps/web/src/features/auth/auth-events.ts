const AUTH_LOGGED_OUT_EVENT = "shortly:auth-logged-out";

function canUseWindow() {
  return typeof window !== "undefined";
}

export function dispatchAuthLoggedOutEvent() {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_LOGGED_OUT_EVENT));
}

export function subscribeToAuthLoggedOut(handler: () => void) {
  if (!canUseWindow()) {
    return () => {};
  }

  window.addEventListener(AUTH_LOGGED_OUT_EVENT, handler);

  return () => {
    window.removeEventListener(AUTH_LOGGED_OUT_EVENT, handler);
  };
}
