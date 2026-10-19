import { Banner } from '../models';
import { INITIAL_BANNERS } from '../data/initialData';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'folmishti_banners';

function getLocalBanners(): Banner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BANNERS));
      return INITIAL_BANNERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BANNERS;
  }
}

function saveLocalBanners(banners: Banner[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  } catch (e) {
    console.error(e);
  }
}

export const bannerRepository = {
  async getAll(): Promise<Banner[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'banners'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
        }
      } catch (err) {
        console.warn(err);
      }
    }
    return getLocalBanners();
  },

  async save(banner: Banner): Promise<Banner> {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'banners', banner.id), banner, { merge: true });
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalBanners();
    const idx = list.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      list[idx] = banner;
    } else {
      list.push(banner);
    }
    saveLocalBanners(list);
    return banner;
  },

  async delete(bannerId: string): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'banners', bannerId));
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalBanners().filter(b => b.id !== bannerId);
    saveLocalBanners(list);
  }
};
