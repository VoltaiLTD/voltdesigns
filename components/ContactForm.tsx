"use client"; // 

import { useState } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      service: "General",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) alert("Thanks! We’ll get back to you shortly.");
      else alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid sm:grid-cols-2 gap-3 mt-3"
    >
      <input name="name" required placeholder="Full name" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15" />
      <input name="email" required type="email" placeholder="Email" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15" />
      <input name="phone" placeholder="Phone (optional)" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15" />
      <textarea name="message" required placeholder="Your message…" className="rounded-xl px-3 py-2 bg-[#111] border border-white/15 sm:col-span-2 min-h-[100px]" />
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn btn-gold">
          {loading ? "Sending…" : "Send Enquiry"}
        </button>
      </div>
    </form>
  );
}
