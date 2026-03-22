import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import {
  doc, getDoc, setDoc, onSnapshot
} from "firebase/firestore";
import NexuStoreRD from "./NexuStoreRD";

// ── Usuarios permitidos (puedes agregar más) ──────────────────────────────
// Estos se crean desde Firebase Console > Authentication > Add user
// o desde aquí al primer login

const STORAGE_KEY = "nexustorerd-v67";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);

  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email.trim(), loginForm.password);
    } catch (err) {
      const msgs = {
        "auth/invalid-email": "Correo inválido",
        "auth/user-not-found": "Usuario no encontrado",
        "auth/wrong-password": "Contraseña incorrecta",
        "auth/invalid-credential": "Credenciales incorrectas",
        "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
      };
      setLoginError(msgs[err.code] || "Error al iniciar sesión");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => signOut(auth);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#000", color:"#00d4ff", fontFamily:"monospace", fontSize:18 }}>
      <span>⬡ INICIANDO NEXUSTORERD...</span>
    </div>
  );

  if (!user) return (
    <LoginScreen
      form={loginForm}
      setForm={setLoginForm}
      onLogin={handleLogin}
      error={loginError}
      loading={loginLoading}
      glitch={glitch}
    />
  );

  return (
    <FirebaseDataWrapper user={user} onLogout={handleLogout}>
      <NexuStoreRD />
    </FirebaseDataWrapper>
  );
}

// ── FirebaseDataWrapper — sincroniza localStorage ↔ Firestore ─────────────
function FirebaseDataWrapper({ user, onLogout, children }) {
  const [synced, setSynced] = useState(false);
  const docRef = doc(db, "nexustorerd", "data");

  // Al montar: escuchar cambios en Firestore en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const remoteData = snap.data().payload;
        if (remoteData) {
          // Actualizar localStorage con datos de Firestore
          localStorage.setItem(STORAGE_KEY, remoteData);
        }
      }
      setSynced(true);
    }, (err) => {
      console.error("Error leyendo Firestore:", err);
      setSynced(true);
    });
    return unsub;
  }, []);

  // Escuchar cambios en localStorage y sincronizar a Firestore
  useEffect(() => {
    if (!synced) return;
    const interval = setInterval(async () => {
      const local = localStorage.getItem(STORAGE_KEY);
      if (!local) return;
      try {
        const snap = await getDoc(docRef);
        const remote = snap.exists() ? snap.data().payload : null;
        if (local !== remote) {
          await setDoc(docRef, { payload: local, updatedAt: new Date().toISOString(), updatedBy: user.email });
        }
      } catch (err) {
        console.error("Error sincronizando:", err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [synced, user]);

  if (!synced) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#000", color:"#00d4ff", fontFamily:"monospace", fontSize:16 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:16 }}>⬡</div>
        <div>SINCRONIZANDO CON SERVIDOR...</div>
        <div style={{ fontSize:12, color:"#333", marginTop:8 }}>Conectando a la nube</div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"relative" }}>
      {/* Indicador de estado — web: abajo derecha / móvil: encima del menú inferior */}
      <style>{`
        .status-bar { position:fixed; bottom:16px; right:16px; z-index:9999; display:flex; align-items:center; gap:8px; padding:6px 14px; background:#050505; border:1px solid #00d4ff15; border-radius:20px; }
        @media(max-width:768px){
          .status-bar { bottom:72px; right:12px; padding:4px 10px; border-radius:16px; }
          .status-email { display:none; }
          .status-logout { font-size:9px!important; padding:3px 8px!important; }
        }
      `}</style>
      <div className="status-bar">
        <div style={{ width:7, height:7, borderRadius:"50%", background:"#00e676", boxShadow:"0 0 6px #00e676", flexShrink:0 }} />
        <span className="status-email" style={{ fontSize:11, color:"#444", fontFamily:"monospace", letterSpacing:1 }}>{user.email}</span>
        <button onClick={onLogout}
          className="status-logout"
          style={{ background:"#ff3d5715", color:"#ff3d57", border:"1px solid #ff3d5740", borderRadius:4, cursor:"pointer", fontFamily:"monospace", fontSize:10, fontWeight:700, padding:"4px 10px", letterSpacing:1 }}>
          SALIR
        </button>
      </div>
      {children}
    </div>
  );
}

// ── Pantalla de Login ─────────────────────────────────────────────────────
function LoginScreen({ form, setForm, onLogin, error, loading, glitch }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#000", fontFamily:"'Share Tech Mono','Courier New',monospace", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        @keyframes neonPulse{0%,100%{text-shadow:0 0 5px #00d4ff,0 0 15px #00d4ff}50%{text-shadow:0 0 2px #00d4ff}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glitch{0%,100%{transform:translate(0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}60%{transform:translate(-1px,2px)}80%{transform:translate(1px,-2px)}}
        @keyframes borderGlow{0%,100%{border-color:#00d4ff20}50%{border-color:#00d4ff60}}
        .login-input{width:100%;padding:14px 18px;border:1px solid #1a1a1a;border-radius:6px;font-size:13px;background:#080808;color:#e0e0e0;outline:none;font-family:inherit;letter-spacing:.5px;transition:border-color .2s;}
        .login-input:focus{border-color:#00d4ff40;}
        .login-btn{width:100%;padding:14px;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:2px;cursor:pointer;font-family:inherit;transition:all .2s;text-transform:uppercase;}
        .login-btn:hover{box-shadow:0 0 25px #00d4ff40;transform:translateY(-1px);}
        .scanline{position:fixed;width:100%;height:2px;background:linear-gradient(transparent,#00d4ff08,transparent);animation:scanline 8s linear infinite;pointer-events:none;}
      `}</style>

      {/* Scanline */}
      <div className="scanline" />

      {/* Fondo con grid */}
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(#00d4ff05 1px,transparent 1px),linear-gradient(90deg,#00d4ff05 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />

      {/* Card de login */}
      <div style={{ animation:"fadeIn .5s ease-out", background:"#050505", border:"1px solid #00d4ff20", borderRadius:12, padding:"48px 44px", width:"100%", maxWidth:420, position:"relative", boxShadow:"0 0 60px #00d4ff10" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div className={glitch ? "glitch":""} style={{ fontFamily:"Orbitron,monospace", fontSize:28, fontWeight:900, color:"#00d4ff", letterSpacing:4, animation:"neonPulse 3s ease-in-out infinite" }}>
            NEXU<span style={{ color:"#ff6b35" }}>STORE</span>
          </div>
          <div style={{ color:"#ff6b35", fontSize:12, letterSpacing:5, marginTop:4, fontWeight:700 }}>RD</div>
          <div style={{ fontSize:10, color:"#222", marginTop:8, letterSpacing:2 }}>SISTEMA DE GESTIÓN v4.9</div>
        </div>

        {/* Línea decorativa */}
        <div style={{ height:1, background:"linear-gradient(to right,transparent,#00d4ff30,transparent)", marginBottom:32 }} />

        <form onSubmit={onLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:"#333", display:"block", marginBottom:8, letterSpacing:1.5, fontFamily:"Orbitron,monospace" }}>CORREO ELECTRÓNICO</label>
            <input
              className="login-input"
              type="email"
              value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              placeholder="usuario@ejemplo.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:"#333", display:"block", marginBottom:8, letterSpacing:1.5, fontFamily:"Orbitron,monospace" }}>CONTRASEÑA</label>
            <input
              className="login-input"
              type="password"
              value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ background:"#ff3d5715", border:"1px solid #ff3d5740", borderRadius:6, padding:"10px 14px", fontSize:12, color:"#ff3d57", textAlign:"center", letterSpacing:.5 }}>
              ⚠ {error}
            </div>
          )}

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
            style={{ background: loading?"#00d4ff10":"#00d4ff20", color:"#00d4ff", border:"1px solid #00d4ff60", marginTop:8, opacity: loading?0.7:1 }}>
            {loading ? "VERIFICANDO..." : "◈ INICIAR SESIÓN"}
          </button>
        </form>

        {/* Línea decorativa inferior */}
        <div style={{ height:1, background:"linear-gradient(to right,transparent,#00d4ff20,transparent)", marginTop:32, marginBottom:20 }} />

        <div style={{ textAlign:"center", fontSize:10, color:"#1a1a1a", letterSpacing:1 }}>
          © 2025 NEXUSTORERD · by Jeffrey Vargas
        </div>
      </div>
    </div>
  );
}
