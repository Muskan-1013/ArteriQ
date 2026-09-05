import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AuthError = { 'invalidEmail' : null } |
  { 'emailTaken' : null } |
  { 'notAuthenticated' : null } |
  { 'weakPassword' : null } |
  { 'invalidCredentials' : null };
export type Email = string;
export interface Finding {
  'status' : string,
  'value' : string,
  'parameter' : string,
  'referenceRange' : string,
}
export type ReportId = bigint;
export type Result = { 'ok' : User } |
  { 'err' : AuthError };
export type Result_1 = { 'ok' : SavedReport } |
  { 'err' : AuthError };
export type Result_2 = { 'ok' : SessionToken } |
  { 'err' : AuthError };
export type Result_3 = { 'ok' : Array<SavedReport> } |
  { 'err' : AuthError };
export interface RiskAssessmentInput {
  'prInterval' : bigint,
  'ultrasoundImage' : [] | [Uint8Array | number[]],
  'stSegment' : number,
  'qrsDuration' : bigint,
  'temperature' : number,
  'spo2' : bigint,
  'complexes' : string,
  'qtInterval' : bigint,
  'rrInterval' : bigint,
  'heartRate' : bigint,
}
export type RiskLevel = { 'low' : null } |
  { 'high' : null } |
  { 'moderate' : null };
export interface RiskReport {
  'findings' : Array<Finding>,
  'disclaimer' : string,
  'clinicalExplanation' : string,
  'riskLevel' : RiskLevel,
}
export interface SavedReport {
  'id' : ReportId,
  'report' : RiskReport,
  'createdAt' : bigint,
}
export type SessionToken = string;
export interface User {
  'id' : UserId,
  'name' : string,
  'createdAt' : bigint,
  'salt' : Uint8Array | number[],
  'email' : Email,
  'passwordHash' : Uint8Array | number[],
}
export type UserId = Principal;
export interface _SERVICE {
  'assessRisk' : ActorMethod<[RiskAssessmentInput], RiskReport>,
  'getApiDoc' : ActorMethod<[], string>,
  'getCurrentUser' : ActorMethod<[SessionToken], [] | [User]>,
  'getMyReports' : ActorMethod<[SessionToken], Result_3>,
  'login' : ActorMethod<[Email, string], Result_2>,
  'logout' : ActorMethod<[SessionToken], undefined>,
  'saveReport' : ActorMethod<[SessionToken, RiskReport], Result_1>,
  'signup' : ActorMethod<[string, Email, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
