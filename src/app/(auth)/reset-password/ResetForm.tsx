"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type FormState } from "../actions";
import { Field, FormMessage } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="form" noValidate>
      <FormMessage error={e.form} />
      {e.form && <Link href="/forgot-password">Request a new link</Link>}
      <input type="hidden" name="token" value={token} />
      <Field id="password" label="New password" hint="At least 10 characters." error={e.password}>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
      </Field>
      <Field id="confirm" label="Repeat new password" error={e.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
      </Field>
      <SubmitButton pendingLabel="Saving…">Save new password</SubmitButton>
    </form>
  );
}
