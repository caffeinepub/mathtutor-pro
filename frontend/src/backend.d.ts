import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UpiPayment {
    id: bigint;
    status: UpiPaymentStatus;
    hours: bigint;
    sessionType: string;
    upiTransactionId: string;
    accessCode?: string;
    fullName: string;
    pricePerHour: bigint;
    email: string;
    uniqueCode?: string;
    totalAmount: bigint;
    phone: string;
    courseName: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Attendance {
    id: bigint;
    status: AttendanceStatus;
    studentPrincipal: Principal;
    markedAt: bigint;
    sessionId: bigint;
}
export type UpiPaymentStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "approved";
    approved: string;
} | {
    __kind__: "rejected";
    rejected: string | null;
};
export interface AttendanceSummary {
    presentCount: bigint;
    totalSessions: bigint;
    absentCount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Material {
    id: bigint;
    title: string;
    studentPrincipal: Principal;
    fileData?: Uint8Array;
    description?: string;
    fileLink?: string;
    relatedCourse: string;
    uploadedAt: bigint;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Session {
    id: bigint;
    topic?: string;
    meetLink: string;
    date: string;
    createdAt: bigint;
    time: string;
    durationHours: bigint;
    studentPrincipal: Principal;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    accessCode?: string;
    email: string;
    uniqueCode?: string;
    phone: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum AttendanceStatus {
    present = "present",
    absent = "absent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMaterial(studentPrincipal: Principal, title: string, description: string | null, fileData: Uint8Array | null, fileLink: string | null, relatedCourse: string): Promise<bigint>;
    addProduct(product: ShoppingItem): Promise<void>;
    addSession(studentPrincipal: Principal, date: string, time: string, durationHours: bigint, meetLink: string, topic: string | null): Promise<bigint>;
    adminLogin(email: string, password: string): Promise<boolean>;
    approveUpiPayment(paymentId: bigint, uniqueCode: string): Promise<{
        accessCode: string;
        fullName: string;
        uniqueCode: string;
    } | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateStudent(email: string, enteredUniqueCode: string): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteMaterial(materialId: bigint): Promise<void>;
    deleteProduct(productName: string): Promise<void>;
    deleteSession(sessionId: bigint): Promise<void>;
    findByEmailQuery(email: string): Promise<UpiPayment | null>;
    findUpiPaymentByAccessCode(code: string): Promise<UpiPayment | null>;
    getAllPayments(): Promise<Array<UpiPayment>>;
    getAllUpiPaymentsByEmail(email: string): Promise<Array<UpiPayment>>;
    getAttendanceForStudent(studentPrincipal: Principal): Promise<Array<Attendance>>;
    getAttendanceSummary(studentPrincipal: Principal): Promise<AttendanceSummary>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMaterialsForStudent(studentPrincipal: Principal): Promise<Array<Material>>;
    getPendingPayments(): Promise<Array<UpiPayment>>;
    getProducts(): Promise<Array<ShoppingItem>>;
    getSessionsForStudent(studentPrincipal: Principal): Promise<Array<Session>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUpiPaymentStatus(paymentId: bigint): Promise<UpiPaymentStatus | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    markAttendance(studentPrincipal: Principal, sessionId: bigint, status: AttendanceStatus): Promise<bigint>;
    rejectUpiPayment(paymentId: bigint, rejectionNote: string | null): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    studentFindByEmail(email: string): Promise<UpiPayment | null>;
    submitUpiPayment(courseName: string, sessionType: string, pricePerHour: bigint, hours: bigint, totalAmount: bigint, upiTransactionId: string, fullName: string, email: string, phone: string): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProduct(product: ShoppingItem): Promise<void>;
}
