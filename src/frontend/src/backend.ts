// Hand-written replacement for the auto-generated ICP canister client.
// Talks to the Node.js backend over HTTP instead of a Candid actor.
// Keeps the same exported names/shapes as before so useAuth.tsx and
// useQueries.ts do not need to change.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type SessionToken = string;
export type Email = string;
export type UserId = string;
export type ReportId = number;

export interface User {
  id: UserId;
  name: string;
  email: Email;
  createdAt: number;
}

export enum AuthError {
  invalidEmail = "invalidEmail",
  emailTaken = "emailTaken",
  notAuthenticated = "notAuthenticated",
  weakPassword = "weakPassword",
  invalidCredentials = "invalidCredentials",
}

export enum RiskLevel {
  low = "low",
  moderate = "moderate",
  high = "high",
}

export interface Finding {
  parameter: string;
  value: string;
  referenceRange: string;
  status: string;
}

export interface RiskReport {
  riskLevel: RiskLevel;
  findings: Finding[];
  clinicalExplanation: string;
  disclaimer: string;
}

export interface RiskAssessmentInput {
  heartRate: bigint;
  stSegment: number;
  qtInterval: bigint;
  prInterval: bigint;
  qrsDuration: bigint;
  rrInterval: bigint;
  complexes: string;
  spo2: bigint;
  temperature: number;
  ultrasoundImage?: Uint8Array;
}

export interface SavedReport {
  id: ReportId;
  report: RiskReport;
  createdAt: number;
}

export type Result =
  | { __kind__: "ok"; ok: User }
  | { __kind__: "err"; err: AuthError };

export type Result_1 =
  | { __kind__: "ok"; ok: SavedReport }
  | { __kind__: "err"; err: AuthError };

export type Result_2 =
  | { __kind__: "ok"; ok: SessionToken }
  | { __kind__: "err"; err: AuthError };

export type Result_3 =
  | { __kind__: "ok"; ok: SavedReport[] }
  | { __kind__: "err"; err: AuthError };

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { res, data };
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export class Backend {
  async signup(name: string, email: Email, password: string): Promise<Result> {
    const { res, data } = await request("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) return { __kind__: "err", err: data?.error as AuthError };
    return { __kind__: "ok", ok: data as User };
  }

  async login(email: Email, password: string): Promise<Result_2> {
    const { res, data } = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return { __kind__: "err", err: data?.error as AuthError };
    return { __kind__: "ok", ok: data.token as SessionToken };
  }

  async logout(token: SessionToken): Promise<void> {
    await request("/logout", {
      method: "POST",
      headers: authHeader(token),
    });
  }

  async getCurrentUser(token: SessionToken): Promise<User | null> {
    const { data } = await request("/me", { headers: authHeader(token) });
    return data;
  }

  async assessRisk(input: RiskAssessmentInput): Promise<RiskReport> {
    const payload: Record<string, unknown> = {
      complexes: input.complexes,
      stSegment: input.stSegment,
      temperature: input.temperature,
      heartRate: Number(input.heartRate),
      qtInterval: Number(input.qtInterval),
      prInterval: Number(input.prInterval),
      qrsDuration: Number(input.qrsDuration),
      rrInterval: Number(input.rrInterval),
      spo2: Number(input.spo2),
      // Note: ultrasoundImage upload is not supported by the Node backend
      // (it was unused by the original risk-assessment logic too).
    };
    const { data } = await request("/assess-risk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data as RiskReport;
  }

  async saveReport(token: SessionToken, report: RiskReport): Promise<Result_1> {
    const { res, data } = await request("/reports", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ report }),
    });
    if (!res.ok) return { __kind__: "err", err: data?.error as AuthError };
    return { __kind__: "ok", ok: data as SavedReport };
  }

  async getMyReports(token: SessionToken): Promise<Result_3> {
    const { res, data } = await request("/reports", {
      headers: authHeader(token),
    });
    if (!res.ok) return { __kind__: "err", err: data?.error as AuthError };
    return { __kind__: "ok", ok: data as SavedReport[] };
  }

  async getApiDoc(): Promise<string> {
    const res = await fetch(`${API_URL}/api-doc`);
    return res.text();
  }

  // Not implemented in the Node backend -- these belonged to Caffeine's
  // generic query-builder tooling, not to ArteriQ's own logic. Only needed
  // if useSchema/useExecuteQuery are actually called somewhere in the app.
  async schema(): Promise<string> {
    throw new Error("schema() is not implemented in the Node.js backend");
  }

  async execute(
    _qJson: string,
  ): Promise<{ hasMore: boolean; rows: unknown[][] }> {
    throw new Error("execute() is not implemented in the Node.js backend");
  }
}

export function createActor(): Backend {
  return new Backend();
}
