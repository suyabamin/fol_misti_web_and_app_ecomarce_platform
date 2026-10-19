import * as admin from 'firebase-admin';

export async function handleSetAdminRole(targetUid: string, isAdmin: boolean) {
  // Set custom user claims in Firebase Auth
  await admin.auth().setCustomUserClaims(targetUid, { admin: isAdmin });

  // Also maintain the admins collection in Firestore for fast Security Rules verification
  const db = admin.firestore();
  const adminDocRef = db.collection('admins').doc(targetUid);

  if (isAdmin) {
    const userRecord = await admin.auth().getUser(targetUid);
    await adminDocRef.set({
      uid: targetUid,
      email: userRecord.email,
      assignedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    await adminDocRef.delete();
  }

  return {
    success: true,
    uid: targetUid,
    isAdmin
  };
}
