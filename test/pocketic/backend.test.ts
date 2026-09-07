import { PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
});

afterAll(async () => {
  await pic?.tearDown();
});

/** A fully normal physiological profile — every value inside its reference range. */
function normalInput() {
  return {
    heartRate: 72n,
    stSegment: 0.05,
    qtInterval: 400n,
    prInterval: 160n,
    qrsDuration: 90n,
    rrInterval: 830n,
    complexes: "Normal",
    spo2: 98n,
    temperature: 36.6,
    ultrasoundImage: [] as [] | [Uint8Array],
  };
}

/** A clearly abnormal profile — several values far outside their reference ranges. */
function abnormalInput() {
  return {
    heartRate: 140n,
    stSegment: 2.5,
    qtInterval: 520n,
    prInterval: 260n,
    qrsDuration: 160n,
    rrInterval: 400n,
    complexes: "Abnormal ectopic beats",
    spo2: 85n,
    temperature: 39.5,
    ultrasoundImage: [] as [] | [Uint8Array],
  };
}

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.schema()).resolves.toBeTypeOf("string");
  await expect(actor.getApiDoc()).resolves.toBeTypeOf("string");
});

it("signs up a user with name, email and password, then logs in", async () => {
  const signupResult = await actor.signup("Jane Doe", "jane@example.com", "password123");
  expect(signupResult).toMatchObject({ ok: { name: "Jane Doe", email: "jane@example.com" } });

  const loginResult = await actor.login("jane@example.com", "password123");
  expect(loginResult).toHaveProperty("ok");
  const token = (loginResult as { ok: string }).ok;
  expect(token.length).toBeGreaterThan(0);

  // The issued token resolves to the signed-up user.
  const current = await actor.getCurrentUser(token);
  expect(current).toHaveLength(1);
  expect(current[0]).toMatchObject({ name: "Jane Doe", email: "jane@example.com" });
});

it("rejects an invalid password and an unknown email", async () => {
  await actor.signup("Bob", "bob@example.com", "password123");
  const badPassword = await actor.login("bob@example.com", "wrong-password");
  expect(badPassword).toEqual({ err: { invalidCredentials: null } });
  const unknownEmail = await actor.login("nobody@example.com", "password123");
  expect(unknownEmail).toEqual({ err: { invalidCredentials: null } });
});

it("rejects a duplicate email on sign-up", async () => {
  await actor.signup("Carol", "carol@example.com", "password123");
  const duplicate = await actor.signup("Carol Again", "carol@example.com", "password123");
  expect(duplicate).toEqual({ err: { emailTaken: null } });
});

it("saves a generated report to the account and lists it back", async () => {
  const signupResult = await actor.signup("Dave", "dave@example.com", "password123");
  expect(signupResult).toHaveProperty("ok");
  const loginResult = await actor.login("dave@example.com", "password123");
  const token = (loginResult as { ok: string }).ok;

  const report = await actor.assessRisk(normalInput());
  const saved = await actor.saveReport(token, report);
  expect(saved).toHaveProperty("ok");
  const savedReport = (saved as { ok: { id: bigint; report: unknown } }).ok;
  expect(savedReport.id).toBe(0n);
  expect(savedReport.report).toMatchObject({ riskLevel: { low: null } });

  const mine = await actor.getMyReports(token);
  expect(mine).toHaveProperty("ok");
  expect((mine as { ok: unknown[] }).ok).toHaveLength(1);
});

it("rejects saving a report without a valid session token", async () => {
  const report = await actor.assessRisk(normalInput());
  const result = await actor.saveReport("not-a-real-token", report);
  expect(result).toEqual({ err: { notAuthenticated: null } });
});

it("logs out and invalidates the session token", async () => {
  await actor.signup("Eve", "eve@example.com", "password123");
  const loginResult = await actor.login("eve@example.com", "password123");
  const token = (loginResult as { ok: string }).ok;

  await expect(actor.logout(token)).resolves.toBeNull();

  // After logout the token no longer resolves to a user.
  const current = await actor.getCurrentUser(token);
  expect(current).toEqual([]);
});

it("assessRisk scores a normal profile as low risk", async () => {
  const report = await actor.assessRisk(normalInput());
  expect(report.riskLevel).toEqual({ low: null });
  expect(report.findings).toHaveLength(9);
  expect(report.findings[0]).toMatchObject({ parameter: "Heart rate", status: "Normal" });
  expect(report.disclaimer.length).toBeGreaterThan(0);
  expect(report.clinicalExplanation.length).toBeGreaterThan(0);
});

it("assessRisk scores an abnormal profile as high risk", async () => {
  const report = await actor.assessRisk(abnormalInput());
  expect(report.riskLevel).toEqual({ high: null });
  expect(report.findings).toHaveLength(9);
  expect(report.findings[0]).toMatchObject({ parameter: "Heart rate", status: "Abnormal" });
});

it("assessRisk accepts an optional ultrasound image without trapping", async () => {
  const input = normalInput();
  input.ultrasoundImage = [new Uint8Array([1, 2, 3])];
  const report = await actor.assessRisk(input);
  expect(report.riskLevel).toEqual({ low: null });
});

it("exposes the API documentation and schema without trapping", async () => {
  await expect(actor.getApiDoc()).resolves.toBeTypeOf("string");
  await expect(actor.schema()).resolves.toBeTypeOf("string");
});
