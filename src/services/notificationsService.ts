import { handleFirestoreError, OperationType } from "../lib/firestore_errors";
import { setDoc } from "firebase/firestore";
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Notification } from "../types";

export function subscribeToNotifications(
  userEmail: string,
  userRole: "citizen" | "admin" | "municipal" | "field_team" | "all",
  callback: (notifications: Notification[]) => void
): () => void {
  if (!db) {
    console.warn("Firestore db not initialized, cannot subscribe to notifications.");
    return () => {};
  }
  
  let q = query(collection(db, "notifications"), limit(200));
  if (userRole !== "admin" && userRole !== "municipal" && userRole !== "field_team") {
    q = query(collection(db, "notifications"), where("recipientEmail", "==", userEmail), limit(100));
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let notifList: Notification[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        recipientEmail: data.recipientEmail || "",
        recipientRole: data.recipientRole || "all",
        title: data.title || "Notification",
        message: data.message || "",
        type: data.type || "system",
        reportId: data.reportId || "SYSTEM",
        read: Boolean(data.read ?? data.read_status),
        createdAt: data.createdAt || new Date().toISOString()
      } as Notification;
    });

    // Filter by role/email
    notifList = notifList.filter(n => {
      if (!n.recipientEmail && n.recipientRole === "all") return true;
      if (n.recipientEmail && n.recipientEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      if (userRole === "admin" && (n.recipientRole === "admin" || n.recipientRole === "municipal")) return true;
      if (userRole === "field_team" && (n.recipientRole === "field_team" || n.recipientRole === "all")) return true;
      return false;
    });

    // Sort by createdAt descending
    notifList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    callback(notifList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "notifications");
  });

  return unsubscribe;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (!db) return;
  try {
    const notifRef = doc(db, "notifications", id);
    await updateDoc(notifRef, { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, "notifications");
  }
}

export async function markAllNotificationsAsRead(notifications: Notification[]): Promise<void> {
  if (!db || notifications.length === 0) return;
  try {
    const batch = writeBatch(db);
    notifications.forEach(notif => {
      if (!notif.read) {
        const notifRef = doc(db, "notifications", notif.id);
        batch.update(notifRef, { read: true });
      }
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, "notifications");
  }
}

export async function createNotification(
  title: string,
  message: string,
  type: string,
  recipientRole: "citizen" | "admin" | "municipal" | "all",
  recipientEmail: string = "",
  reportId: string = "SYSTEM"
): Promise<void> {
  if (!db) return;
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    console.warn("[notificationsService] Skipping notification creation: No authenticated Firebase user session.");
    return;
  }
  const notifId = `notif_${Date.now()}`;
  const notifRef = doc(db, "notifications", notifId);
  const path = `notifications/${notifId}`;

  console.log(`[Firestore Pre-Write Auth Check] Operation: ${OperationType.CREATE} | Path: ${path} | Has currentUser: ${Boolean(currentAuthUser)} | UID: ${currentAuthUser.uid}`);

  try {
    await setDoc(notifRef, {
      id: notifId,
      title,
      message,
      type,
      recipientRole,
      recipientEmail,
      reportId,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
