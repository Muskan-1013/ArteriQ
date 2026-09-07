import {
  HeartPulse,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { ArteriQLogo } from "@/components/ArteriQLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

/**
 * Login / Sign-Up screen. A clean glassmorphism card with the adaptive logo.
 * Authentication is email + password only — no Internet Identity, no social
 * login. The card shows the logo + wordmark, a "Welcome back" heading, an
 * email field with a mail icon, a password field with a lock icon, a soft
 * rounded wine "Sign in" button, a "New to ArteriQ? Sign up" link and a small
 * disclaimer.
 */
export function LoginPage() {
  const { login, signup, isLoggingIn, isInitializing, error } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const disabled = isInitializing || isLoggingIn;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === "login") {
      void login(email, password);
    } else {
      void signup(name, email, password);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Theme toggle — top-right corner */}
      <Button
        data-ocid="login_theme_toggle"
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 rounded-full"
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun className="size-5" />
        ) : (
          <Moon className="size-5" />
        )}
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div
          data-ocid="login_panel"
          className="glass-strong rounded-3xl p-8 sm:p-10"
        >
          <div className="flex flex-col items-center text-center">
            <ArteriQLogo size={72} />
            <h1 className="mt-5 font-display text-3xl tracking-wide text-foreground">
              ArteriQ
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Non-invasive cardiovascular risk screening
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-center font-display text-2xl tracking-tight text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your ArteriQ screening dashboard."
                : "Join ArteriQ to begin your preliminary heart-health screening."}
            </p>

            <form
              data-ocid="auth_form"
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
              noValidate
            >
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Full name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-name"
                      data-ocid="auth_name_input"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="pl-9"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="auth-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    data-ocid="auth_email_input"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="pl-9"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-password" data-ocid="auth_password_input" name="password" type="password" value={password} 
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" autoComplete="off" 
                    required
                  />
                </div>
              </div>

              {error && (
                <p
                  data-ocid="auth_error"
                  role="alert"
                  className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button
                data-ocid="auth_submit_button"
                type="submit"
                size="lg"
                disabled={disabled}
                className="w-full rounded-full"
              >
                {isLoggingIn
                  ? mode === "login"
                    ? "Signing in…"
                    : "Creating account…"
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {mode === "login" ? (
                <p className="text-sm text-muted-foreground">
                  New to ArteriQ?{" "}
                  <button
                    type="button"
                    data-ocid="auth_switch_signup"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    data-ocid="auth_switch_login"
                    onClick={() => switchMode("login")}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Secure
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HeartPulse className="size-3.5" /> Preliminary screening only
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          ArteriQ provides preliminary screening insights only and is not a
          medical diagnosis. Always consult a qualified healthcare professional.
        </p>
      </motion.div>
    </div>
  );
}
