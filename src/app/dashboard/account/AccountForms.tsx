"use client";

import { useActionState } from "react";
import { changePasswordAction, type FormState } from "@/app/(auth)/actions";
import { deleteAccountAction, updateProfileAction } from "./actions";
import { Field, FormMessage } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { COUNTRIES } from "@/lib/countries";
import { CONFIG } from "@/config/site";

type U = { name: string; email: string; country: string | null; experience: string | null; marketingOptIn: boolean };

export function ProfileForm({ user }: { user: U }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="form">
      <FormMessage error={e.form} ok={state.ok} />
      <Field id="email" label="Email" hint="To change your email address, contact us."><input id="email" className="input" value={user.email} disabled /></Field>
      <Field id="name" label="Name" error={e.name}><input id="name" name="name" className="input" defaultValue={user.name} required /></Field>
      <Field id="country" label="Country of residence" error={e.country}>
        <select id="country" name="country" className="select" defaultValue={user.country ?? ""} required>
          <option value="" disabled>Choose…</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </Field>
      <Field id="experience" label="Trading experience">
        <select id="experience" name="experience" className="select" defaultValue={user.experience ?? ""}>
          <option value="">Prefer not to say</option>
          {CONFIG.experienceLevels.map((x) => <option key={x}>{x}</option>)}
        </select>
      </Field>
      <label className="ack"><input type="checkbox" name="marketingOptIn" defaultChecked={user.marketingOptIn} /><span>Email me about new live sessions and cohorts.</span></label>
      <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePasswordAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="form">
      <FormMessage error={e.form} ok={state.ok} />
      <Field id="current" label="Current password" error={e.current}><input id="current" name="current" type="password" autoComplete="current-password" className="input" required /></Field>
      <Field id="new-password" label="New password" hint="At least 10 characters." error={e.password}><input id="new-password" name="password" type="password" autoComplete="new-password" className="input" required /></Field>
      <SubmitButton className="btn btn-ghost" pendingLabel="Saving…">Change password</SubmitButton>
    </form>
  );
}

export function DeleteForm() {
  const [state, action] = useActionState<FormState, FormData>(deleteAccountAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="form">
      <FormMessage error={e.form} />
      <p className="small muted">This removes your personal details and course progress and logs you out everywhere. Records of payments are kept in anonymised form, as the law requires. This can't be undone.</p>
      <Field id="del-password" label="Confirm with your password" error={e.password}><input id="del-password" name="password" type="password" autoComplete="current-password" className="input" required /></Field>
      <SubmitButton className="btn btn-ghost" pendingLabel="Deleting…">Delete my account</SubmitButton>
    </form>
  );
}
