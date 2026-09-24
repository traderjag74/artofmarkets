"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { startCheckout, type CheckoutState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { FormMessage } from "@/components/forms/Field";

type Cohort = { id: string; label: string; full: boolean };

export function CheckoutForm({ slug, cohorts, priceLabel, providerNote }: { slug: string; cohorts: Cohort[] | null; priceLabel: string; providerNote: string }) {
  const [state, action] = useActionState<CheckoutState, FormData>(startCheckout, {});
  const handoff = useRef<HTMLFormElement>(null);

  // Hosted payment pages need a real browser POST; submit the signed form as soon as it arrives.
  useEffect(() => {
    if (state.action?.kind === "form") handoff.current?.submit();
  }, [state.action]);

  return (
    <>
      <form action={action} className="form" noValidate>
        <FormMessage error={state.error} />
        <input type="hidden" name="slug" value={slug} />
        {cohorts && (
          <fieldset className="field">
            <legend>Choose your cohort</legend>
            <div className="stack stack-s">
              {cohorts.map((c, i) => (
                <label key={c.id} className="check" style={{ width: "100%" }}>
                  <input type="radio" name="cohortId" value={c.id} defaultChecked={i === cohorts.findIndex((x) => !x.full)} disabled={c.full} required />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label className="ack">
          <input type="checkbox" name="terms" required />
          <span>
            I accept the <Link href="/legal/terms" target="_blank">terms</Link> and <Link href="/legal/refunds" target="_blank">refund policy</Link>, and I understand this is education, not financial advice.
          </span>
        </label>
        <SubmitButton pendingLabel="Preparing secure payment…">Pay {priceLabel}</SubmitButton>
        <p className="tiny muted">{providerNote}</p>
      </form>
      {state.action?.kind === "form" && (
        <form ref={handoff} method="post" action={state.action.action} aria-hidden="true">
          {Object.entries(state.action.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <noscript><button type="submit">Continue to payment</button></noscript>
        </form>
      )}
    </>
  );
}
