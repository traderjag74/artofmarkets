"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type FormState } from "../actions";
import { Field, FormMessage } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  const e = state.errors ?? {};
  return (
    <section className="section">
      <div className="container form-shell stack stack-l">
        <h1 style={{ fontSize: "var(--step-4)" }}>Reset your password</h1>
        <p className="muted">Enter the email you registered with. We'll send you a link to choose a new password.</p>
        <form action={action} className="form" noValidate>
          <FormMessage error={e.form} ok={state.ok} />
          <Field id="email" label="Email" error={e.email}>
            <input id="email" name="email" type="email" autoComplete="email" required className="input" />
          </Field>
          <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
        </form>
      </div>
    </section>
  );
}
