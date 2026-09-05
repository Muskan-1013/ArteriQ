export const idlFactory = ({ IDL }) => {
  const RiskAssessmentInput = IDL.Record({
    'prInterval' : IDL.Nat,
    'ultrasoundImage' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'stSegment' : IDL.Float64,
    'qrsDuration' : IDL.Nat,
    'temperature' : IDL.Float64,
    'spo2' : IDL.Nat,
    'complexes' : IDL.Text,
    'qtInterval' : IDL.Nat,
    'rrInterval' : IDL.Nat,
    'heartRate' : IDL.Nat,
  });
  const Finding = IDL.Record({
    'status' : IDL.Text,
    'value' : IDL.Text,
    'parameter' : IDL.Text,
    'referenceRange' : IDL.Text,
  });
  const RiskLevel = IDL.Variant({
    'low' : IDL.Null,
    'high' : IDL.Null,
    'moderate' : IDL.Null,
  });
  const RiskReport = IDL.Record({
    'findings' : IDL.Vec(Finding),
    'disclaimer' : IDL.Text,
    'clinicalExplanation' : IDL.Text,
    'riskLevel' : RiskLevel,
  });
  const SessionToken = IDL.Text;
  const UserId = IDL.Principal;
  const Email = IDL.Text;
  const User = IDL.Record({
    'id' : UserId,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'salt' : IDL.Vec(IDL.Nat8),
    'email' : Email,
    'passwordHash' : IDL.Vec(IDL.Nat8),
  });
  const ReportId = IDL.Nat;
  const SavedReport = IDL.Record({
    'id' : ReportId,
    'report' : RiskReport,
    'createdAt' : IDL.Int,
  });
  const AuthError = IDL.Variant({
    'invalidEmail' : IDL.Null,
    'emailTaken' : IDL.Null,
    'notAuthenticated' : IDL.Null,
    'weakPassword' : IDL.Null,
    'invalidCredentials' : IDL.Null,
  });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(SavedReport),
    'err' : AuthError,
  });
  const Result_2 = IDL.Variant({ 'ok' : SessionToken, 'err' : AuthError });
  const Result_1 = IDL.Variant({ 'ok' : SavedReport, 'err' : AuthError });
  const Result = IDL.Variant({ 'ok' : User, 'err' : AuthError });
  return IDL.Service({
    'assessRisk' : IDL.Func([RiskAssessmentInput], [RiskReport], []),
    'getApiDoc' : IDL.Func([], [IDL.Text], ['query']),
    'getCurrentUser' : IDL.Func([SessionToken], [IDL.Opt(User)], ['query']),
    'getMyReports' : IDL.Func([SessionToken], [Result_3], ['query']),
    'login' : IDL.Func([Email, IDL.Text], [Result_2], []),
    'logout' : IDL.Func([SessionToken], [], []),
    'saveReport' : IDL.Func([SessionToken, RiskReport], [Result_1], []),
    'signup' : IDL.Func([IDL.Text, Email, IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
