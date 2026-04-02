import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ApiRequestError,
  createLink,
  type CreatedLink
} from "../../api/links";

const createLinkFormSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Please enter a URL.")
    .refine((value) => {
      try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid absolute http or https URL."),
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

function isFormField(
  value: unknown
): value is keyof CreateLinkFormValues {
  return value === "originalUrl" || value === "customAlias";
}

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function CreateLinkPanel() {
  const [createdLink, setCreatedLink] = useState<CreatedLink | null>(null);
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
    setCreatedLink(null);
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
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setSubmissionError(error.message);

        return;
      }

      setSubmissionError("Something went wrong while creating the short link.");
    }
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Create a short link
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Anonymous link creation
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This is the first tiny frontend integration with the backend slice.
            Frontend validation stays lightweight, and the backend remains the
            source of truth.
          </p>
        </div>

        <form className="mt-8 grid gap-4" noValidate onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="originalUrl"
            >
              Original URL
            </label>
            <input
              {...register("originalUrl")}
              aria-describedby={errors.originalUrl ? "originalUrl-error" : undefined}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={isSubmitting}
              id="originalUrl"
              placeholder="https://example.com/some-page"
              type="url"
            />
            {errors.originalUrl ? (
              <p
                className="text-sm text-rose-700"
                id="originalUrl-error"
                role="alert"
              >
                {errors.originalUrl.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="customAlias"
            >
              Custom alias <span className="text-slate-500">(optional)</span>
            </label>
            <input
              {...register("customAlias")}
              aria-describedby={errors.customAlias ? "customAlias-error" : undefined}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={isSubmitting}
              id="customAlias"
              placeholder="my-alias"
              type="text"
            />
            {errors.customAlias ? (
              <p
                className="text-sm text-rose-700"
                id="customAlias-error"
                role="alert"
              >
                {errors.customAlias.message}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Leave blank to let the backend choose the short code.
              </p>
            )}
          </div>

          {submissionError ? (
            <div
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
              role="alert"
            >
              {submissionError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex min-w-40 items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create short link"}
            </button>
            <p className="text-sm text-slate-500">
              The request is sent to `POST /api/links`.
            </p>
          </div>
        </form>
      </div>

      <article className="rounded-[2rem] border border-slate-900/10 bg-white/75 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Latest response
        </p>
        {createdLink ? (
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Original URL</dt>
              <dd className="mt-1 break-all text-slate-900">
                {createdLink.originalUrl}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Short URL</dt>
              <dd className="mt-1 break-all">
                <a
                  className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4"
                  href={createdLink.shortUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {createdLink.shortUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Short code</dt>
              <dd className="mt-1 text-slate-900">{createdLink.shortCode}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Custom alias</dt>
              <dd className="mt-1 text-slate-900">
                {createdLink.customAlias ?? "Not set"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Created at</dt>
              <dd className="mt-1 text-slate-900">
                {formatCreatedAt(createdLink.createdAt)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Submit the form to render the normalized backend response here.
          </p>
        )}
      </article>
    </div>
  );
}
