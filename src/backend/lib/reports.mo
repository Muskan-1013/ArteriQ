import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Types "../types/reports";

module {
  // Appends a report to the user's saved reports, assigns it a fresh id and
  // timestamp, and returns the stored record.
  public func saveReport(
    reportsByUser : Map.Map<Types.UserId, List.List<Types.SavedReport>>,
    userId : Types.UserId,
    report : Types.RiskReport,
    nextReportId : { var next : Nat },
  ) : Types.SavedReport {
    let saved : Types.SavedReport = {
      id = nextReportId.next;
      report;
      createdAt = Time.now();
    };
    nextReportId.next += 1;
    switch (reportsByUser.get(userId)) {
      case (null) {
        let list = List.empty<Types.SavedReport>();
        list.add(saved);
        reportsByUser.add(userId, list);
      };
      case (?list) {
        list.add(saved);
      };
    };
    saved;
  };

  // Returns all reports saved by the user, newest first.
  public func listReports(
    reportsByUser : Map.Map<Types.UserId, List.List<Types.SavedReport>>,
    userId : Types.UserId,
  ) : [Types.SavedReport] {
    switch (reportsByUser.get(userId)) {
      case (null) { [] };
      case (?list) {
        let arr = list.toArray();
        arr.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
      };
    };
  };
};
