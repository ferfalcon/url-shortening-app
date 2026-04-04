import { z } from "zod";
import {
  createdLinkSchema,
  type CreatedLink
} from "../../api/links";

const SESSION_LINK_HISTORY_KEY = "shortly.session-links";
const MAX_SESSION_LINKS = 5;

const createdLinkHistorySchema = z.array(createdLinkSchema);

function canUseSessionStorage() {
  return typeof window !== "undefined" && "sessionStorage" in window;
}

function normalizeSessionLinkHistory(links: CreatedLink[]) {
  return links.slice(0, MAX_SESSION_LINKS);
}

function clearMalformedSessionLinkHistory() {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(SESSION_LINK_HISTORY_KEY);
  } catch {
    // Ignore sessionStorage failures and keep the UI usable.
  }
}

export function readSessionLinkHistory(): CreatedLink[] {
  if (!canUseSessionStorage()) {
    return [];
  }

  let storedValue: string | null = null;

  try {
    storedValue = window.sessionStorage.getItem(SESSION_LINK_HISTORY_KEY);
  } catch {
    return [];
  }

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    const parsedHistory = createdLinkHistorySchema.safeParse(parsedValue);

    if (!parsedHistory.success) {
      clearMalformedSessionLinkHistory();

      return [];
    }

    return normalizeSessionLinkHistory(parsedHistory.data);
  } catch {
    clearMalformedSessionLinkHistory();

    return [];
  }
}

export function writeSessionLinkHistory(links: CreatedLink[]) {
  if (!canUseSessionStorage()) {
    return;
  }

  const normalizedLinks = normalizeSessionLinkHistory(links);

  try {
    if (normalizedLinks.length === 0) {
      window.sessionStorage.removeItem(SESSION_LINK_HISTORY_KEY);

      return;
    }

    window.sessionStorage.setItem(
      SESSION_LINK_HISTORY_KEY,
      JSON.stringify(normalizedLinks)
    );
  } catch {
    // Ignore sessionStorage failures and keep the UI usable.
  }
}

export function clearSessionLinkHistory() {
  clearMalformedSessionLinkHistory();
}

export function prependSessionLinkHistory(
  currentLinks: CreatedLink[],
  nextLink: CreatedLink
) {
  return normalizeSessionLinkHistory([
    nextLink,
    ...currentLinks.filter((link) => link.id !== nextLink.id)
  ]);
}
