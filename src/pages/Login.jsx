import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";
import { Lock } from "lucide-react";
import { auth } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: "Wrong email or password.",
        background: "#1a0508",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full glass px-4 py-3 bg-white/5 outline-none focus:border-brand transition placeholder:text-white/40";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[radial-gradient(circle_at_50%_20%,rgba(239,68,68,0.2),transparent_55%)]">
      <form onSubmit={handleSubmit} className="glass w-full max-w-sm p-8 space-y-4">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="p-3 rounded-xl border border-brand/40 text-brand-soft">
            <Lock />
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
        </div>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
