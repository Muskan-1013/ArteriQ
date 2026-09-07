import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Types "../types/risk-assessment";

module {
  // Status codes: 0 = Normal, 1 = Borderline, 2 = Abnormal.
  private func statusText(status : Nat) : Text {
    switch (status) {
      case (0) "Normal";
      case (1) "Borderline";
      case _ "Abnormal";
    };
  };

  // Each helper returns (status, valueText, referenceRange).
  private func heartRate(hr : Nat) : (Nat, Text, Text) {
    if (hr >= 60 and hr <= 100) {
      (0, hr.toText() # " bpm", "60-100 bpm");
    } else if (hr >= 50 and hr <= 110) {
      (1, hr.toText() # " bpm", "60-100 bpm");
    } else {
      (2, hr.toText() # " bpm", "60-100 bpm");
    };
  };

  private func stSegment(st : Float) : (Nat, Text, Text) {
    if (st >= -0.5 and st <= 0.5) {
      (0, st.toText() # " mV", "-0.5 to +0.5 mV");
    } else if (st >= -1.0 and st <= 1.0) {
      (1, st.toText() # " mV", "-0.5 to +0.5 mV");
    } else {
      (2, st.toText() # " mV", "-0.5 to +0.5 mV");
    };
  };

  private func qtInterval(qt : Nat) : (Nat, Text, Text) {
    if (qt >= 350 and qt <= 450) {
      (0, qt.toText() # " ms", "350-450 ms");
    } else if (qt >= 330 and qt <= 470) {
      (1, qt.toText() # " ms", "350-450 ms");
    } else {
      (2, qt.toText() # " ms", "350-450 ms");
    };
  };

  private func prInterval(pr : Nat) : (Nat, Text, Text) {
    if (pr >= 120 and pr <= 200) {
      (0, pr.toText() # " ms", "120-200 ms");
    } else if (pr >= 110 and pr <= 220) {
      (1, pr.toText() # " ms", "120-200 ms");
    } else {
      (2, pr.toText() # " ms", "120-200 ms");
    };
  };

  private func qrsDuration(qrs : Nat) : (Nat, Text, Text) {
    if (qrs >= 80 and qrs <= 120) {
      (0, qrs.toText() # " ms", "80-120 ms");
    } else if (qrs >= 70 and qrs <= 130) {
      (1, qrs.toText() # " ms", "80-120 ms");
    } else {
      (2, qrs.toText() # " ms", "80-120 ms");
    };
  };

  private func rrInterval(rr : Nat) : (Nat, Text, Text) {
    if (rr >= 600 and rr <= 1000) {
      (0, rr.toText() # " ms", "600-1000 ms");
    } else if (rr >= 500 and rr <= 1100) {
      (1, rr.toText() # " ms", "600-1000 ms");
    } else {
      (2, rr.toText() # " ms", "600-1000 ms");
    };
  };

  private func spo2(s : Nat) : (Nat, Text, Text) {
    if (s >= 95 and s <= 100) {
      (0, s.toText() # " %", "95-100%");
    } else if (s >= 90 and s <= 94) {
      (1, s.toText() # " %", "95-100%");
    } else {
      (2, s.toText() # " %", "95-100%");
    };
  };

  private func temperature(temp : Float) : (Nat, Text, Text) {
    if (temp >= 36.5 and temp <= 37.5) {
      (0, temp.toText() # " °C", "36.5-37.5 °C");
    } else if (temp >= 36.0 and temp <= 38.0) {
      (1, temp.toText() # " °C", "36.5-37.5 °C");
    } else {
      (2, temp.toText() # " °C", "36.5-37.5 °C");
    };
  };

  // P/QRS/T complexes are described as free text. A normal/regular morphology
  // is scored normal; an explicitly abnormal/irregular description is scored
  // abnormal; anything else is treated as borderline (unable to confirm).
  private func complexes(desc : Text) : (Nat, Text, Text) {
    let lower = desc.toLower();
    if (lower.contains(#text "normal") or lower.contains(#text "regular")) {
      (0, desc, "Normal morphology");
    } else if (lower.contains(#text "abnormal") or lower.contains(#text "irregular") or lower.contains(#text "ectopic")) {
      (2, desc, "Normal morphology");
    } else {
      (1, desc, "Normal morphology");
    };
  };

  private func finding(parameter : Text, status : Nat, value : Text, referenceRange : Text) : Types.Finding {
    {
      parameter;
      value;
      referenceRange;
      status = statusText(status);
    };
  };

  private func riskLevel(score : Nat) : Types.RiskLevel {
    if (score <= 2) {
      #low;
    } else if (score <= 5) {
      #moderate;
    } else {
      #high;
    };
  };

  private func explanation(level : Types.RiskLevel, abnormalCount : Nat, borderlineCount : Nat) : Text {
    let base = switch (level) {
      case (#low) "Based on the physiological parameters provided, the overall cardiovascular risk appears low. Most measured values fall within normal reference ranges.";
      case (#moderate) "Based on the physiological parameters provided, the overall cardiovascular risk appears moderate. One or more measured values fall outside the normal reference range and warrant closer attention.";
      case (#high) "Based on the physiological parameters provided, the overall cardiovascular risk appears high. Several measured values deviate significantly from normal reference ranges and require prompt clinical review.";
    };
    let detail = if (abnormalCount > 0) {
      " " # abnormalCount.toText() # " parameter(s) were outside the normal range and " # borderlineCount.toText() # " were borderline.";
    } else if (borderlineCount > 0) {
      " " # borderlineCount.toText() # " parameter(s) were borderline and would benefit from re-measurement.";
    } else {
      "";
    };
    base # detail;
  };

  public func assessRisk(input : Types.RiskAssessmentInput) : Types.RiskReport {
    let hr = heartRate(input.heartRate);
    let st = stSegment(input.stSegment);
    let qt = qtInterval(input.qtInterval);
    let pr = prInterval(input.prInterval);
    let qrs = qrsDuration(input.qrsDuration);
    let rr = rrInterval(input.rrInterval);
    let cx = complexes(input.complexes);
    let sp = spo2(input.spo2);
    let temp = temperature(input.temperature);

    let findings = [
      finding("Heart rate", hr.0, hr.1, hr.2),
      finding("ST segment", st.0, st.1, st.2),
      finding("QT interval", qt.0, qt.1, qt.2),
      finding("PR interval", pr.0, pr.1, pr.2),
      finding("QRS duration", qrs.0, qrs.1, qrs.2),
      finding("RR interval", rr.0, rr.1, rr.2),
      finding("P/QRS/T complexes", cx.0, cx.1, cx.2),
      finding("SpO₂", sp.0, sp.1, sp.2),
      finding("Temperature", temp.0, temp.1, temp.2),
    ];

    let score = hr.0 + st.0 + qt.0 + pr.0 + qrs.0 + rr.0 + cx.0 + sp.0 + temp.0;
    let abnormalCount = (if (hr.0 == 2) { 1 } else { 0 })
      + (if (st.0 == 2) { 1 } else { 0 })
      + (if (qt.0 == 2) { 1 } else { 0 })
      + (if (pr.0 == 2) { 1 } else { 0 })
      + (if (qrs.0 == 2) { 1 } else { 0 })
      + (if (rr.0 == 2) { 1 } else { 0 })
      + (if (cx.0 == 2) { 1 } else { 0 })
      + (if (sp.0 == 2) { 1 } else { 0 })
      + (if (temp.0 == 2) { 1 } else { 0 });
    let borderlineCount = (if (hr.0 == 1) { 1 } else { 0 })
      + (if (st.0 == 1) { 1 } else { 0 })
      + (if (qt.0 == 1) { 1 } else { 0 })
      + (if (pr.0 == 1) { 1 } else { 0 })
      + (if (qrs.0 == 1) { 1 } else { 0 })
      + (if (rr.0 == 1) { 1 } else { 0 })
      + (if (cx.0 == 1) { 1 } else { 0 })
      + (if (sp.0 == 1) { 1 } else { 0 })
      + (if (temp.0 == 1) { 1 } else { 0 });

    let level = riskLevel(score);

    {
      riskLevel = level;
      findings;
      clinicalExplanation = explanation(level, abnormalCount, borderlineCount);
      disclaimer = "This report is a preliminary screening tool only and is not a medical diagnosis. It does not replace professional medical evaluation. Please consult a qualified healthcare provider for any concerns.";
    };
  };
};
