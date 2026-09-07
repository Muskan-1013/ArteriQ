module {
  public type UserId = Principal;
  public type Email = Text;
  public type SessionToken = Text;

  public type User = {
    id : UserId;
    name : Text;
    email : Email;
    passwordHash : Blob;
    salt : Blob;
    createdAt : Int;
  };

  public type Session = {
    token : SessionToken;
    userId : UserId;
    createdAt : Int;
    expiresAt : Int;
  };

  public type AuthError = {
    #emailTaken;
    #invalidCredentials;
    #notAuthenticated;
    #invalidEmail;
    #weakPassword;
  };
};
