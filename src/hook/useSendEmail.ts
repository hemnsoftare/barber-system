import { useMutation } from "@tanstack/react-query";

type EmailPayload = {
  to: string;
  from: string;
  subject: string;
  message: string;
  emailUser: string;
  html?: string;
};
export const sendEmail = async (payload: EmailPayload) => {
  const res = await fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result?.error || "Unknown error");
  }

  return result;
};

export function useSendEmail() {
  return useMutation({
    mutationFn: async (data: EmailPayload) => {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result?.error || "Unknown error");
      }

      return result;
    },
  });
}
