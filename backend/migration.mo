import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Blob "mo:core/Blob";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Stripe "stripe/stripe";

module {
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    products : Map.Map<Text, Stripe.ShoppingItem>;
    configuration : ?Stripe.StripeConfiguration;
    upiPayments : Map.Map<Nat, {
      id : Nat;
      courseName : Text;
      sessionType : Text;
      pricePerHour : Nat;
      hours : Nat;
      totalAmount : Nat;
      upiTransactionId : Text;
      fullName : Text;
      email : Text;
      phone : Text;
      status : {
        #pending;
        #approved : Text;
        #rejected : ?Text;
      };
      accessCode : ?Text;
    }>;
    nextPaymentId : Nat;
    userProfiles : Map.Map<Principal, {
      name : Text;
      email : Text;
      phone : Text;
      accessCode : ?Text;
    }>;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    products : Map.Map<Text, Stripe.ShoppingItem>;
    configuration : ?Stripe.StripeConfiguration;
    upiPayments : Map.Map<Nat, {
      id : Nat;
      courseName : Text;
      sessionType : Text;
      pricePerHour : Nat;
      hours : Nat;
      totalAmount : Nat;
      upiTransactionId : Text;
      fullName : Text;
      email : Text;
      phone : Text;
      status : {
        #pending;
        #approved : Text;
        #rejected : ?Text;
      };
      accessCode : ?Text;
    }>;
    nextPaymentId : Nat;
    userProfiles : Map.Map<Principal, {
      name : Text;
      email : Text;
      phone : Text;
      accessCode : ?Text;
    }>;
    sessions : Map.Map<Nat, {
      id : Nat;
      studentId : Nat;
      date : Text;
      time : Text;
      durationHours : Nat;
      meetLink : Text;
      topic : ?Text;
      createdAt : Nat;
    }>;
    nextSessionId : Nat;
    materials : Map.Map<Nat, {
      id : Nat;
      studentId : Nat;
      title : Text;
      description : ?Text;
      fileData : ?Blob;
      fileLink : ?Text;
      relatedCourse : Text;
      uploadedAt : Nat;
    }>;
    nextMaterialId : Nat;
    attendanceRecords : Map.Map<Nat, {
      id : Nat;
      studentId : Nat;
      sessionId : Nat;
      status : {
        #present;
        #absent;
      };
      markedAt : Nat;
    }>;
    nextAttendanceId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      sessions = Map.empty<Nat, {
        id : Nat;
        studentId : Nat;
        date : Text;
        time : Text;
        durationHours : Nat;
        meetLink : Text;
        topic : ?Text;
        createdAt : Nat;
      }>();
      nextSessionId = 1;
      materials = Map.empty<Nat, {
        id : Nat;
        studentId : Nat;
        title : Text;
        description : ?Text;
        fileData : ?Blob;
        fileLink : ?Text;
        relatedCourse : Text;
        uploadedAt : Nat;
      }>();
      nextMaterialId = 1;
      attendanceRecords = Map.empty<Nat, {
        id : Nat;
        studentId : Nat;
        sessionId : Nat;
        status : {
          #present;
          #absent;
        };
        markedAt : Nat;
      }>();
      nextAttendanceId = 1;
    };
  };
};
