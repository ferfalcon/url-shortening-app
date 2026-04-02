import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import bgShortenDesktopUrl from "../../assets/landing/bg-shorten-desktop.svg";
import bgShortenMobileUrl from "../../assets/landing/bg-shorten-mobile.svg";
import {
  ApiRequestError,
  createLink,
  type CreatedLink
} from "../../api/links";

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

function isFormField(
  value: unknown
): value is keyof CreateLinkFormValues {
  return value === "originalUrl" || value === "customAlias";
}

const inputClassName =
  "w-full rounded-[10px] border-[3px] bg-white px-4 py-3 text-lg leading-9 text-[var(--color-very-dark-violet)] outline-none transition placeholder:text-[var(--color-grayish-violet)] focus-visible:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-70 md:min-h-16 md:px-8";

export function CreateLinkPanel() {
  const [createdLink, setCreatedLink] = useState<CreatedLink | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
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

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    setCopyStatus("idle");
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

      setCreatedLink(nextLink);
      setCopyStatus("idle");
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

  async function handleCopyShortUrl() {
    if (!createdLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdLink.shortUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
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
        <p className="sr-only">
          {copyStatus === "copied"
            ? "Short link copied to clipboard."
            : copyStatus === "error"
              ? "Copy to clipboard failed."
              : createdLink
                ? `Latest short link ready: ${createdLink.shortUrl}`
                : ""}
        </p>
        {createdLink ? (
          <article className="overflow-hidden rounded-[5px] bg-white shadow-[0_10px_24px_rgba(58,48,84,0.08)]">
            <div className="px-6 py-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-6">
              <div className="min-w-0">
                <p className="break-all text-base text-[var(--color-very-dark-violet)]">
                  {createdLink.originalUrl}
                </p>
                {createdLink.customAlias ? (
                  <p className="mt-2 text-sm text-[var(--color-grayish-violet)]">
                    Custom alias:{" "}
                    <span className="font-bold text-[var(--color-dark-violet)]">
                      {createdLink.customAlias}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="mt-4 border-t border-[var(--color-surface)] pt-4 md:mt-0 md:border-t-0 md:pt-0">
                <a
                  className="break-all text-base font-bold text-[var(--color-cyan)] transition hover:text-[var(--color-dark-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                  href={createdLink.shortUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {createdLink.shortUrl}
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
                onClick={handleCopyShortUrl}
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
        ) : null}
      </div>
    </section>
  );
}
