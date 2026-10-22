// Conexão com o Firebase para a comanda ao vivo.
// Expõe a mesma interface que o app já usava: db.doc(caminho).get/set/update/onSnapshot.
import { firebaseConfig } from './config.js';

const V = '10.12.2';
const CDN = `https://www.gstatic.com/firebasejs/${V}`;

export async function connect() {
  if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  const [{ initializeApp }, { getAuth, signInAnonymously }, fs] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-auth.js`),
    import(`${CDN}/firebase-firestore.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  if (!auth.currentUser) await signInAnonymously(auth);
  const db = fs.getFirestore(app);
  const snap = s => ({ exists: s.exists(), data: () => s.data() });
  return {
    uid: auth.currentUser.uid,
    doc(path) {
      const ref = fs.doc(db, path);
      return {
        get: async () => snap(await fs.getDoc(ref)),
        set: data => fs.setDoc(ref, data),
        // mescla só os campos que mudaram (objetos aninhados também), para várias pessoas editarem juntas
        update: patch => fs.setDoc(ref, patch, { merge: true }),
        onSnapshot: (ok, err) => fs.onSnapshot(ref, s => ok(snap(s)), err),
      };
    },
  };
}
