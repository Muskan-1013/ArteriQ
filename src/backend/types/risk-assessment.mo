module {
  public type RiskLevel = {
    #low;
    #moderate;
    #high;
  };

  public type RiskAssessmentInput = {
    heartRate : Nat;
    stSegment : Float;
    qtInterval : Nat;
    prInterval : Nat;
    qrsDuration : Nat;
    rrInterval : Nat;
    complexes : Text;
    spo2 : Nat;
    temperature : Float;
    ultrasoundImage : ?Blob;
  };

  public type Finding = {
    parameter : Text;
    value : Text;
    referenceRange : Text;
    status : Text;
  };

  public type RiskReport = {
    riskLevel : RiskLevel;
    findings : [Finding];
    clinicalExplanation : Text;
    disclaimer : Text;
  };
};
