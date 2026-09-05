import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Configure Testing Library to use the app's `data-ocid` attribute as the test
// id, matching the generated components' convention.
import { configure } from "@testing-library/react";
configure({ testIdAttribute: "data-ocid" });

// jsdom does not implement `window.matchMedia`, which the theme hook uses to
// detect the OS colour-scheme preference.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// framer-motion's `whileInView` uses IntersectionObserver, which jsdom does not
// implement. Provide a no-op stub so viewport-triggered animations render.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// The generated `@/backend` wrapper re-exports `ExternalBlob` from
// `@caffeineai/object-storage`, whose ESM build imports extension-less paths
// that Vitest cannot resolve. Mock it so the wrapper module loads.
vi.mock("@caffeineai/object-storage", () => ({
  ExternalBlob: class ExternalBlob {},
}));

// Mutable authentication state shared with the mocked `useAuth` hook. Tests
// mutate this via the exported helpers and reset it in `beforeEach`. The `mock`
// prefix is required so the hoisted `vi.mock` factory can reference it.
export const mockAuthState = {
  user: null as { id: string; name: string; email: string } | null,
  token: null as string | null,
  isAuthenticated: false,
  isInitializing: false,
  isLoginSuccess: false,
  isLoggingIn: false,
  error: null as string | null,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
};

// Mutable actor state returned by the mocked `useActor` hook. Tests set
// `mockActorState.actor` to a typed mock before rendering a component that
// calls the backend.
export const mockActorState = {
  actor: null as unknown,
  isFetching: false,
};

// Mock the app's own `useActor` hook (the local replacement for the platform
// hook that avoids the InternetIdentityProvider dependency). Tests drive the
// actor deterministically through `mockActorState` without a real canister.
// The real hook imports `createActorWithConfig` from
// `@caffeineai/core-infrastructure`, whose ESM build Vitest cannot resolve, so
// mocking the local hook also keeps that package out of the test graph.
vi.mock("@/hooks/useActor", () => ({
  useActor: () => ({
    actor: mockActorState.actor,
    isFetching: mockActorState.isFetching,
  }),
}));

// Mock the app's own `useAuth` hook so component tests can drive the
// email + password authentication state deterministically without a real
// backend session. The real hook depends on the actor and localStorage; the
// mock keeps the auth-gated rendering and the save-report-to-account seam
// testable in isolation.
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuthState,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

export function setAuthState(partial: Partial<typeof mockAuthState>) {
  Object.assign(mockAuthState, partial);
}

export function resetAuthState() {
  mockAuthState.user = null;
  mockAuthState.token = null;
  mockAuthState.isAuthenticated = false;
  mockAuthState.isInitializing = false;
  mockAuthState.isLoginSuccess = false;
  mockAuthState.isLoggingIn = false;
  mockAuthState.error = null;
  mockAuthState.login.mockReset();
  mockAuthState.signup.mockReset();
  mockAuthState.logout.mockReset();
}

export function resetActorState() {
  mockActorState.actor = null;
  mockActorState.isFetching = false;
}
