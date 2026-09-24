"use client";

import { useActionState } from "react";
import { resendVerificationAction, type FormState } from "@/app/(auth)/actions";
import { SubmitButton } from "./forms/SubmitButton";
import { FormMessage } from "./forms/Field";

export function ResendVerification() {
  const [state, action] = useActionState<FormState>(resendVerificationAction, {});
  return (
    <form action={action} className="stack stack-s">
      <FormMessage error={state.errors?.form} ok={state.ok} />
      <SubmitButton className="btn btn-ghost btn-s" pendingLabel="Sending…">Send the link again</SubmitButton>
    </form>
  );
}
