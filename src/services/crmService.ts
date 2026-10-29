import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Creator, DailyLog, ScriptItem, ResourceItem, CalendarMeeting } from '../types';

function sanitizeData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        result[key] = value.map(item => typeof item === 'object' && item !== null ? sanitizeData(item) : item);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Subscribe to Creators
export function subscribeToCreators(onData: (creators: Creator[]) => void): () => void {
  const colRef = collection(db, 'creators');
  return onSnapshot(colRef, (snapshot) => {
    const list: Creator[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Creator);
    });
    if (list.length > 0) {
      onData(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'creators');
  });
}

export async function saveCreatorToFirestore(creator: Creator) {
  try {
    await setDoc(doc(db, 'creators', creator.id), sanitizeData(creator));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `creators/${creator.id}`);
  }
}

export async function deleteCreatorFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'creators', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `creators/${id}`);
  }
}

// Subscribe to Daily Logs
export function subscribeToDailyLogs(onData: (logs: DailyLog[]) => void): () => void {
  const colRef = collection(db, 'dailyLogs');
  return onSnapshot(colRef, (snapshot) => {
    const list: DailyLog[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as DailyLog);
    });
    if (list.length > 0) {
      onData(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'dailyLogs');
  });
}

export async function saveDailyLogToFirestore(log: DailyLog) {
  try {
    await setDoc(doc(db, 'dailyLogs', log.id), sanitizeData(log));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `dailyLogs/${log.id}`);
  }
}

export async function deleteDailyLogFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'dailyLogs', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `dailyLogs/${id}`);
  }
}

// Subscribe to Scripts
export function subscribeToScripts(onData: (scripts: ScriptItem[]) => void): () => void {
  const colRef = collection(db, 'scripts');
  return onSnapshot(colRef, (snapshot) => {
    const list: ScriptItem[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ScriptItem);
    });
    if (list.length > 0) {
      onData(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'scripts');
  });
}

export async function saveScriptToFirestore(script: ScriptItem) {
  try {
    await setDoc(doc(db, 'scripts', script.id), sanitizeData(script));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `scripts/${script.id}`);
  }
}

export async function deleteScriptFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'scripts', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `scripts/${id}`);
  }
}

// Subscribe to Resources (Vault)
export function subscribeToResources(onData: (resources: ResourceItem[]) => void): () => void {
  const colRef = collection(db, 'resources');
  return onSnapshot(colRef, (snapshot) => {
    const list: ResourceItem[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ResourceItem);
    });
    if (list.length > 0) {
      onData(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'resources');
  });
}

export async function saveResourceToFirestore(res: ResourceItem) {
  try {
    await setDoc(doc(db, 'resources', res.id), sanitizeData(res));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `resources/${res.id}`);
  }
}

export async function deleteResourceFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'resources', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `resources/${id}`);
  }
}

// Subscribe to Meetings (Calendar)
export function subscribeToMeetings(onData: (meetings: CalendarMeeting[]) => void): () => void {
  const colRef = collection(db, 'meetings');
  return onSnapshot(colRef, (snapshot) => {
    const list: CalendarMeeting[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as CalendarMeeting);
    });
    if (list.length > 0) {
      onData(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'meetings');
  });
}

export async function saveMeetingToFirestore(meeting: CalendarMeeting) {
  try {
    await setDoc(doc(db, 'meetings', meeting.id), sanitizeData(meeting));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `meetings/${meeting.id}`);
  }
}

export async function deleteMeetingFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'meetings', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `meetings/${id}`);
  }
}

// Bulk sync all data to Firestore (ensures everything is permanently backed up in cloud)
export async function syncAllToFirestore(data: {
  creators: Creator[];
  dailyLogs: DailyLog[];
  scripts: ScriptItem[];
  resources: ResourceItem[];
  meetings: CalendarMeeting[];
}): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;
    // Sync creators
    for (const c of data.creators) {
      if (c && c.id) {
        await setDoc(doc(db, 'creators', c.id), sanitizeData(c));
        count++;
      }
    }
    // Sync logs
    for (const l of data.dailyLogs) {
      if (l && l.id) {
        await setDoc(doc(db, 'dailyLogs', l.id), sanitizeData(l));
        count++;
      }
    }
    // Sync scripts
    for (const s of data.scripts) {
      if (s && s.id) {
        await setDoc(doc(db, 'scripts', s.id), sanitizeData(s));
        count++;
      }
    }
    // Sync resources
    for (const r of data.resources) {
      if (r && r.id) {
        await setDoc(doc(db, 'resources', r.id), sanitizeData(r));
        count++;
      }
    }
    // Sync meetings
    for (const m of data.meetings) {
      if (m && m.id) {
        await setDoc(doc(db, 'meetings', m.id), sanitizeData(m));
        count++;
      }
    }
    return { success: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    handleFirestoreError(err, OperationType.WRITE, 'bulk_sync');
    return { success: false, count: 0, error: message };
  }
}

// Seed initial mock data into Firestore if cloud collections are empty
export async function seedInitialDataIfEmpty(initial: {
  creators: Creator[];
  dailyLogs: DailyLog[];
  scripts: ScriptItem[];
  resources: ResourceItem[];
}) {
  try {
    const creatorsSnap = await getDocs(collection(db, 'creators'));
    if (creatorsSnap.empty && initial.creators.length > 0) {
      for (const c of initial.creators) {
        await setDoc(doc(db, 'creators', c.id), sanitizeData(c));
      }
    }

    const logsSnap = await getDocs(collection(db, 'dailyLogs'));
    if (logsSnap.empty && initial.dailyLogs.length > 0) {
      for (const l of initial.dailyLogs) {
        await setDoc(doc(db, 'dailyLogs', l.id), sanitizeData(l));
      }
    }

    const scriptsSnap = await getDocs(collection(db, 'scripts'));
    if (scriptsSnap.empty && initial.scripts.length > 0) {
      for (const s of initial.scripts) {
        await setDoc(doc(db, 'scripts', s.id), sanitizeData(s));
      }
    }

    const resSnap = await getDocs(collection(db, 'resources'));
    if (resSnap.empty && initial.resources.length > 0) {
      for (const r of initial.resources) {
        await setDoc(doc(db, 'resources', r.id), sanitizeData(r));
      }
    }
  } catch (err) {
    console.warn('Initial cloud seed attempt:', err);
  }
}
