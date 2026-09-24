"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type FormState } from "../actions";
import { Field, FormMessage, describedBy } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="form" noValidate>
      <FormMessage error={e.form} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="Email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby={describedBy("email", e.email)} />
      </Field>
      <Field id="password" label="Password" error={e.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" aria-invalid={!!e.password} aria-describedby={describedBy("password", e.password)} />
      </Field>
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
        <Link href="/forgot-password" className="small">Forgot your password?</Link>
      </div>
    </form>
  );
}
