import * as admin from 'firebase-admin';
import { ThemeId } from '../types';

const ALLOWED_THEMES: ThemeId[] = ['default', 'mango', 'orange', 'lychee', 'mishti'];

export async function handlePublishTheme(themeId: ThemeId, adminUid: string) {
  if (!ALLOWED_THEMES.includes(themeId)) {
    throw new Error(`Invalid theme ID "${themeId}". Allowed themes: ${ALLOWED_THEMES.join(', ')}`);
  }

  const db = admin.firestore();
  const themeDocRef = db.collection('settings').doc('appearance');

  await themeDocRef.set({
    activeTheme: themeId,
    themeVersion: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: adminUid
  }, { merge: true });

  return {
    success: true,
    activeTheme: themeId,
    updatedAt: new Date().toISOString()
  };
}
