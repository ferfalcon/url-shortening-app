import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import bgShortenDesktopUrl from "../../assets/landing/bg-shorten-desktop.svg";
import bgShortenMobileUrl from "../../assets/landing/bg-shorten-mobile.svg";
import { ApiRequestError } from "../../api/api-client";
import { createLink, type CreatedLink } from "../../api/links";
import { subscribeToAuthLoggedOut } from "../auth/auth-events";
import {
  clearSessionLinkHistory,
  prependSessionLinkHistory,
  readSessionLinkHistory,
  writeSessionLinkHistory
} from "./session-link-history";

const createLinkFormSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Please add a link")
    .refine((value) => {
      try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Please enter a valid URL"),
  customAlias: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return value.trim() === "" ? undefined : value;
    },
    z
      .string()
      .trim()
      .min(3, "Alias must be between 3 and 16 characters.")
      .max(16, "Alias must be between 3 and 16 characters.")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Alias may contain only letters, numbers, hyphens, and underscores."
      )
      .optional()
  )
});

type CreateLinkFormValues = {
  originalUrl: string;
  customAlias: string;
};

type CopyStatus = "copied" | "error" | "idle";
type CopyStatusByLinkId = Record<string, CopyStatus>;

function isFormField(
  value: unknown
): value is keyof CreateLinkFormValues {
  return value === "originalUrl" || value === "customAlias";
}

const inputClassName =
  "w-full rounded-[10px] border-[3px] bg-white px-4 py-3 text-lg leading-9 text-[var(--color-very-dark-violet)] outline-none transition placeholder:text-[var(--color-grayish-violet)] focus-visible:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-70 md:min-h-16 md:px-8";

export function CreateLinkPanel() {
  const [copyStatuses, setCopyStatuses] = useState<CopyStatusByLinkId>({});
  const [liveMessage, setLiveMessage] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [sessionLinks, setSessionLinks] = useState<CreatedLink[]>(
    () => readSessionLinkHistory()
  );
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
    setError
  } = useForm<CreateLinkFormValues>({
    defaultValues: {
      originalUrl: "",
      customAlias: ""
    }
  });

  useEffect(() => {
    writeSessionLinkHistory(sessionLinks);
  }, [sessionLinks]);

  useEffect(() => {
    return subscribeToAuthLoggedOut(() => {
      clearSessionLinkHistory();
      setCopyStatuses({});
      setLiveMessage("");
      setSessionLinks([]);
      setSubmissionError(null);
    });
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    setCopyStatuses({});
    setLiveMessage("");
    clearErrors();

    const parsedValues = createLinkFormSchema.safeParse(values);

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const field = issue.path[0];

        if (isFormField(field)) {
          setError(field, {
            type: "manual",
            message: issue.message
          });
        }
      }

      return;
    }

    try {
      const nextLink = await createLink({
        originalUrl: parsedValues.data.originalUrl,
        ...(parsedValues.data.customAlias
          ? { customAlias: parsedValues.data.customAlias }
          : {})
      });

      setSessionLinks((currentSessionLinks) =>
        prependSessionLinkHistory(currentSessionLinks, nextLink)
      );
      setLiveMessage(`Latest short link ready: ${nextLink.shortUrl}`);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.statusCode === 409 && parsedValues.data.customAlias) {
          setError("customAlias", {
            type: "server",
            message: error.message
          });

          return;
        }

        setSubmissionError(error.message);

        return;
      }

      setSubmissionError("Something went wrong while creating the short link.");
    }
  });

  async function handleCopyShortUrl(sessionLink: CreatedLink) {
    setLiveMessage("");

    try {
      await navigator.clipboard.writeText(sessionLink.shortUrl);
      setCopyStatuses((currentStatuses) => ({
        ...currentStatuses,
        [sessionLink.id]: "copied"
      }));
      setLiveMessage("Short link copied to clipboard.");
    } catch {
      setCopyStatuses((currentStatuses) => ({
        ...currentStatuses,
        [sessionLink.id]: "error"
      }));
      setLiveMessage("Copy to clipboard failed.");
    }
  }

  function handleClearSessionLinks() {
    clearSessionLinkHistory();
    setSessionLinks([]);
    setCopyStatuses({});
    setLiveMessage("Session links cleared.");
  }

  return (
    <section className="grid gap-4">
      <div className="relative overflow-hidden rounded-[10px] bg-[var(--color-dark-violet)] px-6 py-6 shadow-[0_16px_32px_rgba(58,48,84,0.18)] md:px-16 md:py-[52px]">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-right-top md:hidden"
          src={bgShortenMobileUrl}
        />
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          src={bgShortenDesktopUrl}
        />

        <form
          className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_188px]"
          noValidate
          onSubmit={onSubmit}
        >
          <div className="grid gap-2 md:gap-3">
            <label className="sr-only" htmlFor="originalUrl">
              Original URL
            </label>
            <input
              {...register("originalUrl")}
              aria-invalid={errors.originalUrl ? "true" : "false"}
              aria-describedby={errors.originalUrl ? "originalUrl-error" : undefined}
              autoComplete="url"
              className={`${inputClassName} ${
                errors.originalUrl
                  ? "border-[var(--color-red)] placeholder:text-[rgba(244,98,98,0.55)]"
                  : "border-transparent"
              }`}
              disabled={isSubmitting}
              id="originalUrl"
              placeholder="Shorten a link here..."
              spellCheck={false}
              type="url"
            />
            {errors.originalUrl ? (
              <p
                className="text-xs font-medium italic text-[var(--color-red)] md:text-sm"
                id="originalUrl-error"
                role="alert"
              >
                {errors.originalUrl.message}
              </p>
            ) : null}
          </div>

          <button
            className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[var(--color-cyan)] px-6 py-3 text-lg font-bold text-white transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:bg-[var(--color-cyan-hover)] md:min-h-16"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Shortening..." : "Shorten It!"}
          </button>

          <div className="grid gap-2 md:col-span-2 md:gap-3">
            <label
              className="text-sm font-bold text-white"
              htmlFor="customAlias"
            >
              Custom alias <span className="font-medium text-white/70">(optional)</span>
            </label>
            <input
              {...register("customAlias")}
              aria-invalid={errors.customAlias ? "true" : "false"}
              aria-describedby={errors.customAlias ? "customAlias-error" : undefined}
              className={`${inputClassName} ${
                errors.customAlias
                  ? "border-[var(--color-red)] placeholder:text-[rgba(244,98,98,0.55)]"
                  : "border-transparent"
              }`}
              disabled={isSubmitting}
              id="customAlias"
              placeholder="my-alias"
              spellCheck={false}
              type="text"
            />
            {errors.customAlias ? (
              <p
                className="text-xs font-medium italic text-[var(--color-red)] md:text-sm"
                id="customAlias-error"
                role="alert"
              >
                {errors.customAlias.message}
              </p>
            ) : (
              <p className="text-sm text-white/75">
                Leave blank to let the API choose the short code.
              </p>
            )}
          </div>

          {submissionError ? (
            <div
              className="rounded-[10px] border border-[rgba(244,98,98,0.3)] bg-[rgba(244,98,98,0.1)] px-4 py-3 text-sm text-white md:col-span-2"
              role="alert"
            >
              {submissionError}
            </div>
          ) : null}
        </form>
      </div>

      <div aria-live="polite" className="grid gap-4">
        <p className="sr-only">{liveMessage}</p>
        {sessionLinks.length > 0 ? (
          <>
            <div className="flex flex-col gap-3 rounded-[5px] bg-white/70 px-1 py-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-very-dark-violet)]">
                  Session links
                </h2>
                <p className="text-sm text-[var(--color-grayish-violet)]">
                  Stored only in this browser session. Newest links appear first.
                </p>
              </div>

              <button
                className="inline-flex min-h-10 items-center justify-center self-start rounded-full border border-[var(--color-gray)] px-4 py-2 text-sm font-bold text-[var(--color-very-dark-violet)] transition hover:border-[var(--color-dark-violet)] hover:text-[var(--color-dark-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:self-auto"
                onClick={handleClearSessionLinks}
                type="button"
              >
                Clear session links
              </button>
            </div>

            <div className="grid gap-3">
              {sessionLinks.map((sessionLink, index) => {
                const copyStatus = copyStatuses[sessionLink.id] ?? "idle";

                return (
                  <article
                    className="overflow-hidden rounded-[5px] bg-white shadow-[0_10px_24px_rgba(58,48,84,0.08)]"
                    key={sessionLink.id}
                  >
                    <div className="px-6 py-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-6">
                      <div className="min-w-0">
                        {index === 0 ? (
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-cyan)]">
                            Latest result
                          </p>
                        ) : null}
                        <p className="break-all text-base text-[var(--color-very-dark-violet)]">
                          {sessionLink.originalUrl}
                        </p>
                        {sessionLink.customAlias ? (
                          <p className="mt-2 text-sm text-[var(--color-grayish-violet)]">
                            Custom alias:{" "}
                            <span className="font-bold text-[var(--color-dark-violet)]">
                              {sessionLink.customAlias}
                            </span>
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-4 border-t border-[var(--color-surface)] pt-4 md:mt-0 md:border-t-0 md:pt-0">
                        <a
                          className="break-all text-base font-bold text-[var(--color-cyan)] transition hover:text-[var(--color-dark-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                          href={sessionLink.shortUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {sessionLink.shortUrl}
                        </a>
                      </div>

                      <button
                        className={`mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[5px] px-6 py-3 text-base font-bold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:mt-0 md:w-[103px] ${
                          copyStatus === "copied"
                            ? "bg-[var(--color-dark-violet)] focus-visible:outline-[var(--color-dark-violet)]"
                            : copyStatus === "error"
                              ? "bg-[var(--color-red)] hover:bg-[var(--color-red)] focus-visible:outline-[var(--color-red)]"
                              : "bg-[var(--color-cyan)] hover:bg-[var(--color-cyan-hover)] focus-visible:outline-[var(--color-cyan)]"
                        }`}
                        onClick={() => void handleCopyShortUrl(sessionLink)}
                        type="button"
                      >
                        {copyStatus === "copied"
                          ? "Copied!"
                          : copyStatus === "error"
                            ? "Copy failed"
                            : "Copy"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
