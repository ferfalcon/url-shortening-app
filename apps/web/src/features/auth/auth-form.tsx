import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ApiRequestError } from "../../api/api-client";
import type { AuthCredentialsInput } from "../../api/auth";

const authFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
});

type AuthFormMode = "login" | "signup";

type AuthFormValues = {
  email: string;
  password: string;
};

type AuthFormProps = {
  isAuthBootstrapLoading: boolean;
  mode: AuthFormMode;
  onSubmit: (input: AuthCredentialsInput) => Promise<void>;
};

const inputClassName =
  "w-full rounded-[10px] border bg-white px-4 py-3 text-base text-[var(--color-very-dark-violet)] outline-none transition placeholder:text-[var(--color-grayish-violet)] focus-visible:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-70";

const authFormCopy = {
  login: {
    alternateHref: "/signup",
    alternateLabel: "Sign up",
    alternatePrompt: "Need an account?",
    description:
      "Log in to keep your session active across reloads and prepare for saved links later.",
    heading: "Log in",
    submitLabel: "Log in",
    submittingLabel: "Logging in..."
  },
  signup: {
    alternateHref: "/login",
    alternateLabel: "Log in",
    alternatePrompt: "Already have an account?",
    description:
      "Create an account to start using Shortly with a real server-side session.",
    heading: "Sign up",
    submitLabel: "Create account",
    submittingLabel: "Creating account..."
  }
} as const;

function isFormField(value: unknown): value is keyof AuthFormValues {
  return value === "email" || value === "password";
}

export function AuthForm({
  isAuthBootstrapLoading,
  mode,
  onSubmit
}: AuthFormProps) {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
    setError
  } = useForm<AuthFormValues>({
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const copy = authFormCopy[mode];

  const submitAuthForm = handleSubmit(async (values) => {
    setSubmissionError(null);
    clearErrors();

    const parsedValues = authFormSchema.safeParse(values);

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
      await onSubmit(parsedValues.data);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setSubmissionError(error.message);

        return;
      }

      setSubmissionError("Something went wrong while submitting the form.");
    }
  });

  return (
    <section
      aria-labelledby={`${mode}-heading`}
      className="mx-auto w-full max-w-[32rem] rounded-[18px] bg-white p-6 shadow-[0_20px_44px_rgba(58,48,84,0.08)] md:p-8"
    >
      <h1
        className="text-[32px] font-bold tracking-[-0.02em] text-[var(--color-very-dark-violet)]"
        id={`${mode}-heading`}
      >
        {copy.heading}
      </h1>
      <p className="mt-3 text-base leading-7 text-[var(--color-grayish-violet)]">
        {copy.description}
      </p>

      {isAuthBootstrapLoading ? (
        <p
          aria-live="polite"
          className="mt-8 rounded-[10px] bg-[var(--color-surface)] px-4 py-4 text-sm text-[var(--color-grayish-violet)]"
        >
          Checking your current session...
        </p>
      ) : (
        <form className="mt-8 grid gap-5" noValidate onSubmit={submitAuthForm}>
          <div className="grid gap-2">
            <label
              className="text-sm font-bold text-[var(--color-very-dark-violet)]"
              htmlFor={`${mode}-email`}
            >
              Email
            </label>
            <input
              {...register("email")}
              aria-describedby={errors.email ? `${mode}-email-error` : undefined}
              aria-invalid={errors.email ? "true" : "false"}
              autoComplete="email"
              className={`${inputClassName} ${
                errors.email
                  ? "border-[var(--color-red)]"
                  : "border-[rgba(59,48,84,0.12)]"
              }`}
              disabled={isSubmitting}
              id={`${mode}-email`}
              placeholder="user@example.com"
              type="email"
            />
            {errors.email ? (
              <p
                className="text-sm text-[var(--color-red)]"
                id={`${mode}-email-error`}
                role="alert"
              >
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-bold text-[var(--color-very-dark-violet)]"
              htmlFor={`${mode}-password`}
            >
              Password
            </label>
            <input
              {...register("password")}
              aria-describedby={
                errors.password ? `${mode}-password-error` : `${mode}-password-hint`
              }
              aria-invalid={errors.password ? "true" : "false"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={`${inputClassName} ${
                errors.password
                  ? "border-[var(--color-red)]"
                  : "border-[rgba(59,48,84,0.12)]"
              }`}
              disabled={isSubmitting}
              id={`${mode}-password`}
              placeholder="At least 8 characters"
              type="password"
            />
            {errors.password ? (
              <p
                className="text-sm text-[var(--color-red)]"
                id={`${mode}-password-error`}
                role="alert"
              >
                {errors.password.message}
              </p>
            ) : (
              <p
                className="text-sm text-[var(--color-grayish-violet)]"
                id={`${mode}-password-hint`}
              >
                Use the same password rules as the backend: minimum 8 characters.
              </p>
            )}
          </div>

          {submissionError ? (
            <div
              className="rounded-[10px] border border-[rgba(244,98,98,0.25)] bg-[rgba(244,98,98,0.08)] px-4 py-3 text-sm text-[var(--color-red)]"
              role="alert"
            >
              {submissionError}
            </div>
          ) : null}

          <button
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 py-3 text-base font-bold text-white transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:bg-[var(--color-cyan-hover)]"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? copy.submittingLabel : copy.submitLabel}
          </button>

          <p className="text-sm text-[var(--color-grayish-violet)]">
            {copy.alternatePrompt}{" "}
            <Link
              className="font-bold text-[var(--color-cyan)] transition hover:text-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
              to={copy.alternateHref}
            >
              {copy.alternateLabel}
            </Link>
          </p>
        </form>
      )}
    </section>
  );
}
