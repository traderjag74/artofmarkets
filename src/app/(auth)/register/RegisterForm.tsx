"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type FormState } from "../actions";
import { Field, FormMessage, describedBy } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { COUNTRIES } from "@/lib/countries";

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});
  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="form" noValidate>
      <FormMessage error={e.form} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="name" label="Name" error={e.name}>
        <input id="name" name="name" autoComplete="name" required className="input" defaultValue={v.name} aria-invalid={!!e.name} aria-describedby={describedBy("name", e.name)} />
      </Field>
      <Field id="email" label="Email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={v.email} aria-invalid={!!e.email} aria-describedby={describedBy("email", e.email)} />
      </Field>
      <Field id="password" label="Password" hint="At least 10 characters." error={e.password}>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="input" aria-invalid={!!e.password} aria-describedby={describedBy("password", e.password, "hint")} />
      </Field>
      <Field id="country" label="Country of residence" hint="We use this for pricing currency and the rules that apply to you." error={e.country}>
        <select id="country" name="country" required className="select" defaultValue={v.country ?? ""} aria-invalid={!!e.country} aria-describedby={describedBy("country", e.country, "hint")}>
          <option value="" disabled>Choose…</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </Field>
      <div className="field">
        <label className="ack">
          <input type="checkbox" name="riskAck" required aria-invalid={!!e.riskAck} />
          <span>I understand that trading involves substantial risk, that most retail traders lose money, and that {`Art of Markets`} provides education, not financial advice.</span>
        </label>
        {e.riskAck && <p className="error" role="alert">{e.riskAck}</p>}
      </div>
      <label className="ack">
        <input type="checkbox" name="marketingOptIn" />
        <span>Email me when new live sessions and cohorts are announced. (Optional, unsubscribe any time.)</span>
      </label>
      <SubmitButton pendingLabel="Creating account…">Create free account</SubmitButton>
      <p className="small muted">
        By creating an account you agree to the <Link href="/legal/terms">terms</Link> and <Link href="/legal/privacy">privacy policy</Link>.
      </p>
    </form>
  );
}
