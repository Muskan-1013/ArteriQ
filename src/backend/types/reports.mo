import AuthTypes "auth";
import RiskTypes "risk-assessment";

module {
  public type UserId = AuthTypes.UserId;
  public type RiskReport = RiskTypes.RiskReport;

  public type ReportId = Nat;

  // A risk report persisted to a user's account.
  public type SavedReport = {
    id : ReportId;
    report : RiskReport;
    createdAt : Int;
  };
};
