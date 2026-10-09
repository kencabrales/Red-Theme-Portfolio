import { useState } from "react";
import Swal from "sweetalert2";
import { Mail, Send, MapPin } from "lucide-react";
import Reveal from "./Reveal";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const swalTheme = { background: "#1a0508", color: "#fff", confirmButtonColor: "#ef4444" };

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        read: false,
        createdAt: serverTimestamp(),
      });

      await Swal.fire({
        icon: "success",
        title: "Message sent!",
        text: "Thanks for reaching out. I'll get back to you soon.",
        ...swalTheme,
      });
      setForm({ name: "", email: "", message: "" });
    } catch {
      Swal.fire({ icon: "error", title: "Oops", text: "Something went wrong. Try again.", ...swalTheme });
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full glass px-4 py-3 bg-white/5 outline-none focus:border-brand transition placeholder:text-white/40";

  return (
    <section id="contact" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-soft">Get In Touch</h2>
            <p className="mt-3 text-white/70">Have a project in mind? Let's talk.</p>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-10">
          <Reveal x={-40} y={0}>
            <div className="space-y-5">
              <div className="glass p-5 flex items-center gap-4">
                <Mail className="text-brand-soft" />
                <span>youremail@example.com</span>
              </div>
              <div className="glass p-5 flex items-center gap-4">
                <MapPin className="text-brand-soft" />
                <span>Your City, Country</span>
              </div>
            </div>
          </Reveal>

          <Reveal x={40} y={0} delay={0.15}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" className={inputClass} />
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Your email" className={inputClass} />
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Your message" className={inputClass} />
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium disabled:opacity-60"
              >
                <Send size={16} /> {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
