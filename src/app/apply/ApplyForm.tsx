"use client";

import Link from "next/link";
import { useActionState } from "react";
import { applyAction, type ApplyState } from "./actions";
import { CONFIG } from "@/config/site";
import { COUNTRIES } from "@/lib/countries";
import { Field, FormMessage, describedBy } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

type Props = { defaults: { name?: string; email?: string; country?: string; interest: string }; sim: string | null; loggedIn: boolean };

export function ApplyForm({ defaults, sim, loggedIn }: Props) {
  const [state, action] = useActionState<ApplyState, FormData>(applyAction, {});
  const e = state.errors ?? {};

  if (state.reference) {
    return (
      <div className="stack stack-l" role="status">
        <p className="badge badge-accent">Request received</p>
        <h2 style={{ fontSize: "var(--step-3)" }}>Thank you. We'll be in touch.</h2>
        <p>Your reference is <strong className="num">{state.reference}</strong>. We've sent a confirmation to {state.email}.</p>
        <ol className="stack stack-s">
          <li>A member of the desk reads your answers (usually within one working day).</li>
          <li>We contact you at the moment you chose, by email first.</li>
          <li>On the call we talk about your goals and which programme fits, if any. No sales script, no personal investment advice.</li>
        </ol>
        <div className="cluster">
          <Link href={loggedIn ? "/learn/foundations" : "/register?next=/learn/foundations"} className="btn btn-primary">Start Foundations while you wait</Link>
          <Link href="/#simulator" className="btn btn-ghost">Back to the simulator</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="form" noValidate>
      <FormMessage error={e.form} />
      {sim && <input type="hidden" name="sim" value={sim} />}
      <div className="grid grid-2" style={{ ["--gap" as string]: "var(--s-5)" }}>
        <Field id="name" label="Name" error={e.name}>
          <input id="name" name="name" autoComplete="name" required className="input" defaultValue={defaults.name} aria-invalid={!!e.name} aria-describedby={describedBy("name", e.name)} />
        </Field>
        <Field id="email" label="Email" error={e.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={defaults.email} aria-invalid={!!e.email} aria-describedby={describedBy("email", e.email)} />
        </Field>
        <Field id="country" label="Country of residence" error={e.country}>
          <select id="country" name="country" required className="select" defaultValue={defaults.country ?? ""} aria-invalid={!!e.country}>
            <option value="" disabled>Choose…</option>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </Field>
        <Field id="experience" label="Trading experience" error={e.experience}>
          <select id="experience" name="experience" required className="select" defaultValue="" aria-invalid={!!e.experience}>
            <option value="" disabled>Choose…</option>
            {CONFIG.experienceLevels.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
      </div>

      <fieldset className="field">
        <legend>Markets you're interested in</legend>
        <div className="checks">
          {CONFIG.markets.map((m) => (
            <label key={m} className="check"><input type="checkbox" name="markets" value={m} /> {m}</label>
          ))}
        </div>
        {e.markets && <p className="error" role="alert">{e.markets}</p>}
      </fieldset>

      <div className="grid grid-2" style={{ ["--gap" as string]: "var(--s-5)" }}>
        <Field id="hoursPerWeek" label="Time you can give each week" error={e.hoursPerWeek}>
          <select id="hoursPerWeek" name="hoursPerWeek" required className="select" defaultValue="" aria-invalid={!!e.hoursPerWeek}>
            <option value="" disabled>Choose…</option>
            {CONFIG.hoursPerWeek.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field id="goal" label="Main goal" error={e.goal}>
          <select id="goal" name="goal" required className="select" defaultValue="" aria-invalid={!!e.goal}>
            <option value="" disabled>Choose…</option>
            {CONFIG.goals.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field id="interest" label="I'm interested in" error={e.interest}>
          <select id="interest" name="interest" required className="select" defaultValue={defaults.interest}>
            <option value="intro-call">An intro call: help me choose</option>
            {CONFIG.products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </Field>
        <Field id="contactMoment" label="Best time to contact you" error={e.contactMoment}>
          <select id="contactMoment" name="contactMoment" required className="select" defaultValue="" aria-invalid={!!e.contactMoment}>
            <option value="" disabled>Choose…</option>
            {CONFIG.contactMoments.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
      </div>

      <Field id="message" label="Anything you'd like us to know (optional)" hint="For example, what you've tried so far. Please don't include account details." error={e.message}>
        <textarea id="message" name="message" className="textarea" maxLength={2000} aria-describedby="message-hint" />
      </Field>

      <div className="field">
        <label className="ack">
          <input type="checkbox" name="riskAck" required aria-invalid={!!e.riskAck} />
          <span>I understand trading involves substantial risk and most retail traders lose money. I'm asking about education, not investment advice.</span>
        </label>
        {e.riskAck && <p className="error" role="alert">{e.riskAck}</p>}
      </div>
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <SubmitButton pendingLabel="Sending…">Send request</SubmitButton>
        <p className="tiny muted">We never ask about your capital or account size.</p>
      </div>
    </form>
  );
}
