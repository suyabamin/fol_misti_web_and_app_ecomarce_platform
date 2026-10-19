import { AppearanceSettings, StoreSettings, DeliveryArea, ThemeId } from '../models';
import { INITIAL_STORE_SETTINGS, INITIAL_DELIVERY_AREAS } from '../data/initialData';
import { db, isFirebaseConfigured } from '../services/firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

const THEME_STORAGE_KEY = 'folmishti_active_theme';
const STORE_STORAGE_KEY = 'folmishti_store_settings';
const AREAS_STORAGE_KEY = 'folmishti_delivery_areas';

export const VALID_THEMES: ThemeId[] = ['default', 'mango', 'orange', 'lychee', 'mishti'];

export const settingsRepository = {
  // Appearance & Themes
  async getAppearanceSettings(): Promise<AppearanceSettings> {
    const defaultAppearance: AppearanceSettings = {
      activeTheme: (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId) || 'default',
      themeVersion: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    };

    if (isFirebaseConfigured) {
      try {
        const d = await getDoc(doc(db, 'settings', 'appearance'));
        if (d.exists()) {
          const data = d.data() as AppearanceSettings;
          if (VALID_THEMES.includes(data.activeTheme)) {
            localStorage.setItem(THEME_STORAGE_KEY, data.activeTheme);
            return data;
          }
        }
      } catch (err) {
        console.warn('Failed to load appearance from firestore', err);
      }
    }

    return defaultAppearance;
  },

  async publishTheme(themeId: ThemeId, adminUid: string): Promise<AppearanceSettings> {
    if (!VALID_THEMES.includes(themeId)) {
      throw new Error(`Invalid theme: ${themeId}`);
    }

    const newSettings: AppearanceSettings = {
      activeTheme: themeId,
      themeVersion: Date.now(),
      updatedAt: new Date().toISOString(),
      updatedBy: adminUid
    };

    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    document.documentElement.setAttribute('data-theme', themeId);

    // Dispatch global event so listeners know theme changed
    window.dispatchEvent(new CustomEvent('folmishti_theme_changed', { detail: { themeId } }));

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'settings', 'appearance'), newSettings, { merge: true });
      } catch (err) {
        console.warn('Firestore theme update failed', err);
      }
    }

    return newSettings;
  },

  // Store Settings
  async getStoreSettings(): Promise<StoreSettings> {
    try {
      const raw = localStorage.getItem(STORE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    if (isFirebaseConfigured) {
      try {
        const d = await getDoc(doc(db, 'settings', 'store'));
        if (d.exists()) {
          const s = d.data() as StoreSettings;
          localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(s));
          return s;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(INITIAL_STORE_SETTINGS));
    return INITIAL_STORE_SETTINGS;
  },

  async updateStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(settings));

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
      } catch (err) {
        console.warn(err);
      }
    }

    return settings;
  },

  // Delivery Areas
  async getDeliveryAreas(): Promise<DeliveryArea[]> {
    try {
      const raw = localStorage.getItem(AREAS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'deliveryAreas'));
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryArea));
          localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(INITIAL_DELIVERY_AREAS));
    return INITIAL_DELIVERY_AREAS;
  },

  async saveDeliveryArea(area: DeliveryArea): Promise<DeliveryArea> {
    const list = await this.getDeliveryAreas();
    const idx = list.findIndex(a => a.id === area.id);
    if (idx >= 0) {
      list[idx] = area;
    } else {
      list.push(area);
    }
    localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(list));

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'deliveryAreas', area.id), area, { merge: true });
      } catch (err) {
        console.warn(err);
      }
    }

    return area;
  }
};
