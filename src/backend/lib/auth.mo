import Sha256 "mo:sha2/Sha256";
import Random "mo:core/Random";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat8 "mo:core/Nat8";
import Types "../types/auth";

module {
  // Returns a random 16-byte salt used to salt the password hash.
  public func generateSalt() : async Blob {
    let bytes = Blob.toArray(await Random.blob());
    Array.toBlob(Array.sliceToArray(bytes, 0, 16));
  };

  // Deterministically hashes a password with the given salt using SHA-256.
  public func hashPassword(password : Text, salt : Blob) : Blob {
    let combined = Array.concat(Blob.toArray(salt), Blob.toArray(Text.encodeUtf8(password)));
    Sha256.fromBlob(#sha256, Array.toBlob(combined));
  };

  // Generates a fresh, unpredictable session token (hex-encoded random bytes).
  public func generateSessionToken() : async Text {
    let bytes = Blob.toArray(await Random.blob());
    hexEncode(bytes);
  };

  // Validates an email address shape: a non-empty local part, an '@', and a
  // non-empty domain containing at least one dot.
  public func isValidEmail(email : Types.Email) : Bool {
    let parts = Iter.toArray(email.split(#text "@"));
    if (parts.size() != 2) { return false };
    let local = parts[0];
    let domain = parts[1];
    if (local.size() == 0 or domain.size() == 0) { return false };
    let domainParts = Iter.toArray(domain.split(#text "."));
    if (domainParts.size() < 2) { return false };
    Array.all(domainParts, func p = p.size() > 0);
  };

  // Validates that a password meets the minimum strength policy (8+ chars).
  public func isValidPassword(password : Text) : Bool {
    password.size() >= 8;
  };

  // Encodes a byte array as a lowercase hexadecimal string.
  func hexEncode(bytes : [Nat8]) : Text {
    var out = "";
    for (b in bytes.values()) {
      let n = Nat8.toNat(b);
      out := out # hexDigit(n / 16) # hexDigit(n % 16);
    };
    out;
  };

  // Returns the lowercase hex character for a nibble (0-15).
  func hexDigit(d : Nat) : Text {
    if (d < 10) {
      d.toText();
    } else {
      switch (d) {
        case 10 { "a" };
        case 11 { "b" };
        case 12 { "c" };
        case 13 { "d" };
        case 14 { "e" };
        case _ { "f" };
      };
    };
  };
};
