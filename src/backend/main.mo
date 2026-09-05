import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Result "mo:core/Result";
import Time "mo:core/Time";
import AuthTypes "types/auth";
import ReportTypes "types/reports";
import RiskTypes "types/risk-assessment";
import AuthLib "lib/auth";
import ReportsLib "lib/reports";
import RiskAssessmentLib "lib/risk-assessment";

persistent actor {
  let usersByEmail : Map.Map<AuthTypes.Email, AuthTypes.User> = Map.empty();
  let usersById : Map.Map<AuthTypes.UserId, AuthTypes.User> = Map.empty();
  let sessions : Map.Map<AuthTypes.SessionToken, AuthTypes.Session> = Map.empty();
  let reportsByUser : Map.Map<ReportTypes.UserId, List.List<ReportTypes.SavedReport>> = Map.empty();
  let nextReportId : { var next : Nat } = { var next = 0 };

  public shared ({ caller }) func signup(
    name : Text,
    email : AuthTypes.Email,
    password : Text,
  ) : async Result.Result<AuthTypes.User, AuthTypes.AuthError> {
    if (not AuthLib.isValidEmail(email)) { return #err(#invalidEmail) };
    if (not AuthLib.isValidPassword(password)) { return #err(#weakPassword) };
    if (usersByEmail.get(email) != null) { return #err(#emailTaken) };
    let salt = await AuthLib.generateSalt();
    let passwordHash = AuthLib.hashPassword(password, salt);
    let user : AuthTypes.User = {
      id = caller; name; email; passwordHash; salt; createdAt = Time.now();
    };
    usersByEmail.add(email, user);
    usersById.add(caller, user);
    #ok(user);
  };

  public func login(
    email : AuthTypes.Email,
    password : Text,
  ) : async Result.Result<AuthTypes.SessionToken, AuthTypes.AuthError> {
    switch (usersByEmail.get(email)) {
      case (null) { #err(#invalidCredentials) };
      case (?user) {
        let hash = AuthLib.hashPassword(password, user.salt);
        if (hash != user.passwordHash) {
          #err(#invalidCredentials);
        } else {
          let token = await AuthLib.generateSessionToken();
          let now = Time.now();
          let session : AuthTypes.Session = {
            token; userId = user.id; createdAt = now;
            expiresAt = now + 2_592_000_000_000_000;
          };
          sessions.add(token, session);
          #ok(token);
        };
      };
    };
  };

  public shared ({ caller }) func logout(token : AuthTypes.SessionToken) : async () {
    switch (sessions.get(token)) {
      case (?s) { if (s.userId == caller) { sessions.remove(token) } };
      case null {};
    };
  };

  public query func getCurrentUser(token : AuthTypes.SessionToken) : async ?AuthTypes.User {
    switch (sessions.get(token)) {
      case (?s) { if (s.expiresAt < Time.now()) { null } else { usersById.get(s.userId) } };
      case null { null };
    };
  };

  public func assessRisk(input : RiskTypes.RiskAssessmentInput) : async RiskTypes.RiskReport {
    RiskAssessmentLib.assessRisk(input);
  };

  public func saveReport(
    token : AuthTypes.SessionToken,
    report : RiskTypes.RiskReport,
  ) : async Result.Result<ReportTypes.SavedReport, AuthTypes.AuthError> {
    switch (sessions.get(token)) {
      case (null) { #err(#notAuthenticated) };
      case (?s) {
        if (s.expiresAt < Time.now()) { #err(#notAuthenticated) }
        else { #ok(ReportsLib.saveReport(reportsByUser, s.userId, report, nextReportId)) };
      };
    };
  };

  public query func getMyReports(
    token : AuthTypes.SessionToken,
  ) : async Result.Result<[ReportTypes.SavedReport], AuthTypes.AuthError> {
    switch (sessions.get(token)) {
      case (null) { #err(#notAuthenticated) };
      case (?s) {
        if (s.expiresAt < Time.now()) { #err(#notAuthenticated) }
        else { #ok(ReportsLib.listReports(reportsByUser, s.userId)) };
      };
    };
  };

  public query func getApiDoc() : async Text {
    "ArteriQ backend: email+password auth, deterministic risk assessment, and per-user saved reports.";
  };
};
