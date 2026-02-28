import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Stripe "stripe/stripe";
import Text "mo:core/Text";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import UserApproval "user-approval/approval";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  // Use approval state for administrative tasks
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // Student data
  public type Student = {
    principal : Principal;
    fullName : Text;
    email : Text;
    phone : Text;
    course : Text;
    sessionType : Text;
    hours : Nat;
    paymentStatus : {
      #stripe : Stripe.StripeSessionStatus;
      #upi : UpiPaymentStatus;
    };
    transactionId : Text;
    enrollmentDate : Nat;
    isActive : Bool;
  };

  let students = Map.empty<Principal, Student>();

  public shared ({ caller }) func finishStudentRegistration(
    fullName : Text,
    email : Text,
    phone : Text,
    course : Text,
    sessionType : Text,
    hours : Nat,
    paymentType : { #stripe : Stripe.StripeSessionStatus; #upi : UpiPaymentStatus },
    transactionId : Text
  ) : async () {
    // Only authenticated (non-anonymous) users can register as students
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to complete registration");
    };

    validateStudentFields(fullName, email, phone, course, sessionType);

    let student : Student = {
      principal = caller;
      fullName;
      email;
      phone;
      course;
      sessionType;
      hours;
      paymentStatus = paymentType;
      transactionId;
      enrollmentDate = Int.abs(Time.now());
      isActive = true;
    };

    students.add(caller, student);
  };

  public shared ({ caller }) func updateStudent(
    principal : Principal,
    fullName : Text,
    email : Text,
    phone : Text,
    course : Text,
    sessionType : Text,
    hours : Nat,
    paymentStatus : {
      #stripe : Stripe.StripeSessionStatus;
      #upi : UpiPaymentStatus;
    },
    transactionId : Text,
    enrollmentDate : Nat,
    isActive : Bool,
  ) : async () {
    // Only admins can update students
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };

    validateStudentFields(fullName, email, phone, course, sessionType);

    let updatedStudent : Student = {
      principal;
      fullName;
      email;
      phone;
      course;
      sessionType;
      hours;
      paymentStatus;
      transactionId;
      enrollmentDate;
      isActive;
    };

    students.add(principal, updatedStudent);
  };

  func validateStudentFields(fullName : Text, email : Text, phone : Text, course : Text, sessionType : Text) {
    if (fullName.size() == 0) {
      Runtime.trap("Full name must not be empty");
    };
    if (email.size() == 0) {
      Runtime.trap("Email must not be empty");
    };
    if (phone.size() == 0) {
      Runtime.trap("Phone must not be empty");
    };
    if (course.size() == 0) {
      Runtime.trap("Course must not be empty");
    };
    if (sessionType.size() == 0) {
      Runtime.trap("Session type must not be empty");
    };
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all students");
    };
    students.values().toArray();
  };

  public query ({ caller }) func getMyEnrollment() : async ?Student {
    // Only authenticated users can retrieve their own enrollment
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view your enrollment");
    };
    students.get(caller);
  };

  // Sessions
  public type Session = {
    id : Nat;
    studentPrincipal : Principal;
    date : Text;
    time : Text;
    durationHours : Nat;
    meetLink : Text;
    topic : ?Text;
    createdAt : Nat;
  };

  var nextSessionId = 1;
  let sessions = Map.empty<Nat, Session>();

  public shared ({ caller }) func addSession(
    studentPrincipal : Principal,
    date : Text,
    time : Text,
    durationHours : Nat,
    meetLink : Text,
    topic : ?Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add sessions");
    };

    let sessionId = nextSessionId;
    nextSessionId += 1;

    let session : Session = {
      id = sessionId;
      studentPrincipal;
      date;
      time;
      durationHours;
      meetLink;
      topic;
      createdAt = Int.abs(Time.now());
    };

    sessions.add(sessionId, session);
    sessionId;
  };

  public query ({ caller }) func getSessionsForStudent(studentPrincipal : Principal) : async [Session] {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admin can query any student's sessions
      return sessions.values().toArray().filter(
        func(s : Session) : Bool { s.studentPrincipal == studentPrincipal }
      );
    };

    // Authenticated users can only query their own sessions
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view sessions");
    };
    if (caller != studentPrincipal) {
      Runtime.trap("Unauthorized: You can only view your own sessions");
    };
    sessions.values().toArray().filter(
      func(s : Session) : Bool { s.studentPrincipal == studentPrincipal }
    );
  };

  public shared ({ caller }) func deleteSession(sessionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete sessions");
    };
    sessions.remove(sessionId);
  };

  // Materials
  public type Material = {
    id : Nat;
    studentPrincipal : Principal;
    title : Text;
    description : ?Text;
    fileData : ?Blob;
    fileLink : ?Text;
    relatedCourse : Text;
    uploadedAt : Nat;
  };

  var nextMaterialId = 1;
  let materials = Map.empty<Nat, Material>();

  public shared ({ caller }) func addMaterial(
    studentPrincipal : Principal,
    title : Text,
    description : ?Text,
    fileData : ?Blob,
    fileLink : ?Text,
    relatedCourse : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add materials");
    };

    let materialId = nextMaterialId;
    nextMaterialId += 1;

    let material : Material = {
      id = materialId;
      studentPrincipal;
      title;
      description;
      fileData;
      fileLink;
      relatedCourse;
      uploadedAt = Int.abs(Time.now());
    };

    materials.add(materialId, material);
    materialId;
  };

  public query ({ caller }) func getMaterialsForStudent(studentPrincipal : Principal) : async [Material] {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admin can query any student's materials
      return materials.values().toArray().filter(
        func(m : Material) : Bool { m.studentPrincipal == studentPrincipal }
      );
    };

    // Authenticated users can only query their own materials
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view materials");
    };
    if (caller != studentPrincipal) {
      Runtime.trap("Unauthorized: You can only view your own materials");
    };
    materials.values().toArray().filter(
      func(m : Material) : Bool { m.studentPrincipal == studentPrincipal }
    );
  };

  public shared ({ caller }) func deleteMaterial(materialId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete materials");
    };
    materials.remove(materialId);
  };

  // Attendance
  public type AttendanceStatus = {
    #present;
    #absent;
  };

  public type Attendance = {
    id : Nat;
    studentPrincipal : Principal;
    sessionId : Nat;
    status : AttendanceStatus;
    markedAt : Nat;
  };

  var nextAttendanceId = 1;
  let attendanceRecords = Map.empty<Nat, Attendance>();

  public shared ({ caller }) func markAttendance(
    studentPrincipal : Principal,
    sessionId : Nat,
    status : AttendanceStatus
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark attendance");
    };

    let attendanceId = nextAttendanceId;
    nextAttendanceId += 1;

    let attendance : Attendance = {
      id = attendanceId;
      studentPrincipal;
      sessionId;
      status;
      markedAt = Int.abs(Time.now());
    };

    attendanceRecords.add(attendanceId, attendance);
    attendanceId;
  };

  public query ({ caller }) func getAttendanceForStudent(studentPrincipal : Principal) : async [Attendance] {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admin can query any student's attendance
      return attendanceRecords.values().toArray().filter(
        func(a : Attendance) : Bool { a.studentPrincipal == studentPrincipal }
      );
    };

    // Authenticated users can only query their own attendance
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view attendance");
    };
    if (caller != studentPrincipal) {
      Runtime.trap("Unauthorized: You can only view your own attendance");
    };
    attendanceRecords.values().toArray().filter(
      func(a : Attendance) : Bool { a.studentPrincipal == studentPrincipal }
    );
  };

  public type AttendanceSummary = {
    totalSessions : Nat;
    presentCount : Nat;
    absentCount : Nat;
  };

  public query ({ caller }) func getAttendanceSummary(studentPrincipal : Principal) : async AttendanceSummary {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admin can query any student's attendance summary
      var presentCount = 0;
      var absentCount = 0;

      attendanceRecords.values().toArray().forEach(
        func(attendRec : Attendance) {
          if (attendRec.studentPrincipal == studentPrincipal) {
            switch (attendRec.status) {
              case (#present) { presentCount += 1 };
              case (#absent) { absentCount += 1 };
            };
          };
        }
      );

      let totalSessions = presentCount + absentCount;
      return {
        totalSessions;
        presentCount;
        absentCount;
      };
    };

    // Authenticated users can only query their own attendance summary
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view attendance summary");
    };
    if (caller != studentPrincipal) {
      Runtime.trap("Unauthorized: You can only view your own attendance summary");
    };

    var presentCount = 0;
    var absentCount = 0;

    attendanceRecords.values().toArray().forEach(
      func(attendRec : Attendance) {
        if (attendRec.studentPrincipal == studentPrincipal) {
          switch (attendRec.status) {
            case (#present) { presentCount += 1 };
            case (#absent) { absentCount += 1 };
          };
        };
      }
    );

    let totalSessions = presentCount + absentCount;
    {
      totalSessions;
      presentCount;
      absentCount;
    };
  };

  // Product Management
  let products = Map.empty<Text, Stripe.ShoppingItem>();

  public shared ({ caller }) func addProduct(product : Stripe.ShoppingItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.productName, product);
  };

  public shared ({ caller }) func updateProduct(product : Stripe.ShoppingItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.productName, product);
  };

  public shared ({ caller }) func deleteProduct(productName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productName);
  };

  public query func getProducts() : async [Stripe.ShoppingItem] {
    products.values().toArray();
  };

  // Stripe integration
  var configuration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  // Only authenticated users or admins can check Stripe session status
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (
      not AccessControl.hasPermission(accessControlState, caller, #user) and
      not AccessControl.isAdmin(accessControlState, caller)
    ) {
      Runtime.trap("Unauthorized: Must be logged in to check Stripe session status");
    };
    switch (configuration) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  // Only authenticated users can create checkout sessions
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    switch (configuration) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public type UpiPaymentStatus = {
    #pending;
    #approved : Text;
    #rejected : ?Text;
  };

  public type UpiPayment = {
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
    status : UpiPaymentStatus;
    accessCode : ?Text;
    uniqueCode : ?Text;
  };

  let upiPayments = Map.empty<Nat, UpiPayment>();
  var nextPaymentId = 1;

  func padNat(n : Nat) : Text {
    let s = n.toText();
    if (s.size() >= 3) {
      s
    } else if (s.size() == 2) {
      "0" # s;
    } else {
      "00" # s;
    };
  };

  func generateAccessCode(number : Nat) : Text {
    "RJMATH-" # padNat(number);
  };

  public type PaymentResult = {
    #ok : Nat;
    #err : Text;
  };

  public type ApproveResult = {
    #ok : { fullName : Text; accessCode : Text; uniqueCode : Text };
    #err : Text;
  };

  public type RejectResult = {
    #ok : ();
    #err : Text;
  };

  public shared ({ caller }) func submitUpiPayment(
    courseName : Text,
    sessionType : Text,
    pricePerHour : Nat,
    hours : Nat,
    totalAmount : Nat,
    upiTransactionId : Text,
    fullName : Text,
    email : Text,
    phone : Text
  ) : async PaymentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Must be logged in to submit a payment");
    };

    if (courseName.size() == 0) {
      return #err("Course name must not be empty");
    };
    if (sessionType.size() == 0) {
      return #err("Session type must not be empty");
    };
    if (upiTransactionId.size() == 0) {
      return #err("UPI transaction ID must not be empty");
    };
    if (fullName.size() == 0) {
      return #err("Full name must not be empty");
    };
    if (email.size() == 0) {
      return #err("Email must not be empty");
    };
    if (phone.size() == 0) {
      return #err("Phone must not be empty");
    };

    let paymentId = nextPaymentId;
    nextPaymentId += 1;

    let payment : UpiPayment = {
      id = paymentId;
      courseName;
      sessionType;
      pricePerHour;
      hours;
      totalAmount;
      upiTransactionId;
      fullName;
      email;
      phone;
      status = #pending;
      accessCode = null;
      uniqueCode = null;
    };

    upiPayments.add(paymentId, payment);
    #ok(paymentId);
  };

  public shared ({ caller }) func approveUpiPayment(paymentId : Nat, uniqueCode : Text) : async ApproveResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can approve payments");
    };

    if (uniqueCode.size() == 0) {
      return #err("Unique code must not be empty");
    };

    switch (upiPayments.get(paymentId)) {
      case (null) {
        #err("Payment not found");
      };
      case (?payment) {
        switch (payment.status) {
          case (#pending) {
            let accessCode = generateAccessCode(paymentId);
            let updatedPayment : UpiPayment = {
              payment with
              status = #approved(accessCode);
              accessCode = ?accessCode;
              uniqueCode = ?uniqueCode;
            };
            upiPayments.add(paymentId, updatedPayment);

            #ok({
              fullName = payment.fullName;
              accessCode;
              uniqueCode;
            });
          };
          case (_) {
            #err("Payment is not in pending state");
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectUpiPayment(paymentId : Nat, rejectionNote : ?Text) : async RejectResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can reject payments");
    };

    switch (upiPayments.get(paymentId)) {
      case (null) {
        #err("Payment not found");
      };
      case (?payment) {
        switch (payment.status) {
          case (#pending) {
            let updatedPayment : UpiPayment = {
              payment with
              status = #rejected(rejectionNote);
            };
            upiPayments.add(paymentId, updatedPayment);
            #ok(());
          };
          case (_) {
            #err("Payment is not in pending state");
          };
        };
      };
    };
  };

  public query ({ caller }) func getPendingPayments() : async [UpiPayment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get pending payments");
    };

    upiPayments.values().toArray().filter(
      func(p : UpiPayment) : Bool {
        switch (p.status) {
          case (#pending) { true };
          case (_) { false };
        };
      }
    );
  };

  public query ({ caller }) func getAllPayments() : async [UpiPayment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get all payments");
    };

    upiPayments.values().toArray();
  };

  public query ({ caller }) func getUpiPaymentStatus(paymentId : Nat) : async ?UpiPaymentStatus {
    if (
      not AccessControl.hasPermission(accessControlState, caller, #user) and
      not AccessControl.isAdmin(accessControlState, caller)
    ) {
      Runtime.trap("Unauthorized: Must be logged in to check payment status");
    };
    switch (upiPayments.get(paymentId)) {
      case (null) { null };
      case (?p) { ?p.status };
    };
  };

  public query ({ caller }) func getAllUpiPaymentsByEmail(email : Text) : async [UpiPayment] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can query payments by email");
    };
    upiPayments.values().toArray().filter(
      func(p : UpiPayment) : Bool { Text.equal(p.email, email) }
    );
  };

  public query ({ caller }) func findUpiPaymentByAccessCode(code : Text) : async ?UpiPayment {
    if (
      not AccessControl.hasPermission(accessControlState, caller, #user) and
      not AccessControl.isAdmin(accessControlState, caller)
    ) {
      Runtime.trap("Unauthorized: Must be logged in to look up by access code");
    };
    let payments = upiPayments.values().toArray();
    payments.find(
      func(p : UpiPayment) : Bool {
        switch (p.accessCode) {
          case (null) { false };
          case (?c) { Text.equal(c, code) };
        };
      }
    );
  };

  public query ({ caller }) func studentFindByEmail(email : Text) : async ?UpiPayment {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can search students by email");
    };
    let payments = upiPayments.values().toArray();
    payments.find(
      func(p : UpiPayment) : Bool { Text.equal(p.email, email) }
    );
  };

  func findByEmail(email : Text) : ?UpiPayment {
    let payments = upiPayments.values().toArray();
    payments.find(
      func(p : UpiPayment) : Bool { Text.equal(p.email, email) }
    );
  };

  // findByEmailQuery restricted to logged-in users or admins to protect sensitive payment data
  public query ({ caller }) func findByEmailQuery(email : Text) : async ?UpiPayment {
    if (
      not AccessControl.hasPermission(accessControlState, caller, #user) and
      not AccessControl.isAdmin(accessControlState, caller)
    ) {
      Runtime.trap("Unauthorized: Must be logged in to search payments by email");
    };
    findByEmail(email);
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    accessCode : ?Text;
    uniqueCode : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
