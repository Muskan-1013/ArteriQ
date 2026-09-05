import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Result_2 = {
    __kind__: "ok";
    ok: SessionToken;
} | {
    __kind__: "err";
    err: AuthError;
};
export interface User {
    id: UserId;
    name: string;
    createdAt: bigint;
    salt: Uint8Array;
    email: Email;
    passwordHash: Uint8Array;
}
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result_1 = {
    __kind__: "ok";
    ok: SavedReport;
} | {
    __kind__: "err";
    err: AuthError;
};
export type UserId = Principal;
export type ReportId = bigint;
export type Result = {
    __kind__: "ok";
    ok: User;
} | {
    __kind__: "err";
    err: AuthError;
};
export type Result_3 = {
    __kind__: "ok";
    ok: Array<SavedReport>;
} | {
    __kind__: "err";
    err: AuthError;
};
export interface Cell {
    value: Value;
    name: string;
}
export type SessionToken = string;
export interface SavedReport {
    id: ReportId;
    report: RiskReport;
    createdAt: bigint;
}
export interface RiskReport {
    findings: Array<Finding>;
    disclaimer: string;
    clinicalExplanation: string;
    riskLevel: RiskLevel;
}
export interface Finding {
    status: string;
    value: string;
    parameter: string;
    referenceRange: string;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface RiskAssessmentInput {
    prInterval: bigint;
    ultrasoundImage?: Uint8Array;
    stSegment: number;
    qrsDuration: bigint;
    temperature: number;
    spo2: bigint;
    complexes: string;
    qtInterval: bigint;
    rrInterval: bigint;
    heartRate: bigint;
}
export type Email = string;
export enum AuthError {
    invalidEmail = "invalidEmail",
    emailTaken = "emailTaken",
    notAuthenticated = "notAuthenticated",
    weakPassword = "weakPassword",
    invalidCredentials = "invalidCredentials"
}
export enum RiskLevel {
    low = "low",
    high = "high",
    moderate = "moderate"
}
export interface backendInterface {
    assessRisk(input: RiskAssessmentInput): Promise<RiskReport>;
    execute(qJson: string): Promise<Result__1>;
    getApiDoc(): Promise<string>;
    getCurrentUser(token: SessionToken): Promise<User | null>;
    getMyReports(token: SessionToken): Promise<Result_3>;
    login(email: Email, password: string): Promise<Result_2>;
    logout(token: SessionToken): Promise<void>;
    saveReport(token: SessionToken, report: RiskReport): Promise<Result_1>;
    schema(): Promise<string>;
    signup(name: string, email: Email, password: string): Promise<Result>;
}
