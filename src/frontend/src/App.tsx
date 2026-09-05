import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { ArteriQLogo } from "@/components/ArteriQLogo";
import { Layout } from "@/components/Layout";
import { LoginPage } from "@/components/LoginPage";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/hooks/useAuth";
import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";

const FIRST_SPLASH_MS = 1800;
const SECOND_SPLASH_MS = 1500;

export default function App() {
  const { isAuthenticated, isInitializing, isLoginSuccess } = useAuth();
  const [showFirstSplash, setShowFirstSplash] = useState(true);
  const [showSecondSplash, setShowSecondSplash] = useState(false);
  const [view, setView] = useState<"home" | "profile">("home");

  useEffect(() => {
    const timer = setTimeout(() => setShowFirstSplash(false), FIRST_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoginSuccess) return;
    setShowSecondSplash(true);
    const timer = setTimeout(
      () => setShowSecondSplash(false),
      SECOND_SPLASH_MS,
    );
    return () => clearTimeout(timer);
  }, [isLoginSuccess]);

  useEffect(() => {
    if (!isAuthenticated) setView("home");
  }, [isAuthenticated]);

  const showLogin = !isAuthenticated && !isInitializing && !showFirstSplash;
  const showContent = isAuthenticated;

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {showFirstSplash && <SplashScreen key="first-splash" />}
      </AnimatePresence>

      {showLogin && (
        <div className="relative z-10">
          <LoginPage />
        </div>
      )}

      {showContent && (
        <div className="relative z-10">
          <Layout onProfileClick={() => setView("profile")}>
            {view === "profile" ? (
              <Profile onBack={() => setView("home")} />
            ) : (
              <Home />
            )}
          </Layout>
        </div>
      )}

      <AnimatePresence>
        {showSecondSplash && isAuthenticated && (
          <motion.div
            key="second-splash"
            data-ocid="second_splash"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              layoutId="arteriq-logo"
              className="flex flex-col items-center"
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <ArteriQLogo size={120} />
              <span className="mt-4 font-display text-3xl tracking-wide text-foreground">
                ArteriQ
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
