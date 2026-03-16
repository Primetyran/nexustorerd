import { useState, useEffect, useRef } from "react";
// ═══════════════════════════════════════════════════════════
// NEXUSTORERD v4.9 — Sistema de Gestión | by Jeffrey Vargas
// NOVEDADES v4.9: Eliminar compra revierte inventario, nueva categoría en compras, precio venta sincronizado
// ═══════════════════════════════════════════════════════════

const DEMO_DATA = {
  productos: [
    { id:1, codigo:"NX-001", nombre:"Mouse Gamer RGB", categoria:"Mouse", stock:15, stock_minimo:5, precio_compra:25000, precio_venta:55000, estado:"Activo" },
    { id:2, codigo:"NX-002", nombre:"Teclado Mecánico", categoria:"Teclado", stock:8, stock_minimo:3, precio_compra:80000, precio_venta:160000, estado:"Activo" },
    { id:3, codigo:"NX-003", nombre:"Audífonos Gamer 7.1", categoria:"Audio", stock:4, stock_minimo:5, precio_compra:45000, precio_venta:95000, estado:"Activo" },
    { id:4, codigo:"NX-004", nombre:"Mousepad XL Pro", categoria:"Accesorios", stock:20, stock_minimo:5, precio_compra:15000, precio_venta:35000, estado:"Activo" },
    { id:5, codigo:"NX-005", nombre:"Webcam HD 1080p", categoria:"Cámara", stock:6, stock_minimo:3, precio_compra:60000, precio_venta:120000, estado:"Activo" },
    { id:6, codigo:"NX-006", nombre:"Monitor 24\" FHD", categoria:"Monitor", stock:3, stock_minimo:2, precio_compra:350000, precio_venta:650000, estado:"Activo" },
  ],
  clientes: [
    { id:1, nombre:"Carlos Mendoza", cedula:"001-1234567-8", telefono:"809-555-0001", email:"carlos@gmail.com", ciudad:"Santo Domingo", estado:"Activo" },
    { id:2, nombre:"Ana Sofía Ruiz", cedula:"002-9876543-1", telefono:"849-555-0002", email:"ana@gmail.com", ciudad:"Santiago", estado:"Activo" },
    { id:3, nombre:"Pedro Gómez", cedula:"003-4567890-2", telefono:"829-555-0003", email:"pedro@gmail.com", ciudad:"La Romana", estado:"Activo" },
  ],
  ventas: [
    { id:1, codigo:"VTA-001", cliente_id:1, cliente_nombre:"Carlos Mendoza", fecha:"2025-03-01", items:[{nombre:"Mouse Gamer RGB",cantidad:2,precio:55000},{nombre:"Mousepad XL Pro",cantidad:1,precio:35000}], subtotal:145000, descuento:0, total:145000, estado:"Pagado" },
    { id:2, codigo:"VTA-002", cliente_id:2, cliente_nombre:"Ana Sofía Ruiz", fecha:"2025-03-05", items:[{nombre:"Teclado Mecánico",cantidad:1,precio:160000}], subtotal:160000, descuento:10000, total:150000, estado:"Pagado" },
    { id:3, codigo:"VTA-003", cliente_id:3, cliente_nombre:"Pedro Gómez", fecha:"2025-03-10", items:[{nombre:"Audífonos Gamer 7.1",cantidad:1,precio:95000}], subtotal:95000, descuento:0, total:95000, estado:"Pendiente" },
    { id:4, codigo:"VTA-004", cliente_id:1, cliente_nombre:"Carlos Mendoza", fecha:"2025-03-12", items:[{nombre:"Webcam HD 1080p",cantidad:1,precio:120000}], subtotal:120000, descuento:0, total:120000, estado:"Pagado" },
  ],
  compras: [
    { id:1, codigo:"CMP-001", proveedor:"Tech Distribuciones S.A.", fecha:"2025-02-20", items:[{nombre:"Mouse Gamer RGB",cantidad:20,costo:25000},{nombre:"Mousepad XL Pro",cantidad:30,costo:15000}], total:950000 },
    { id:2, codigo:"CMP-002", proveedor:"Electro Import Ltda.", fecha:"2025-03-01", items:[{nombre:"Teclado Mecánico",cantidad:10,costo:80000}], total:800000 },
  ],
  deudas: [
    { id:1, cliente_id:3, cliente_nombre:"Pedro Gómez", descripcion:"Audífonos Gamer 7.1 - VTA-003", monto:95000, monto_pagado:0, fecha_registro:"2025-03-10", fecha_vencimiento:"2025-04-10", estado:"Pendiente" },
  ],
  cotizaciones: [],
};

const CATEGORIAS_DEFAULT = ["Mouse","Teclado","Audio","Monitor","Almacenamiento","Accesorios","Cámara","Otro"];
const STORAGE_KEY = "nexustorerd-v49";
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function NexuStoreRD() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("dashboard");
  const [notify, setNotify] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [glitch, setGlitch] = useState(false);
  const [nuevaCat, setNuevaCat] = useState("");
  const [nuevaCatCompra, setNuevaCatCompra] = useState("");
  const canvasRef = useRef(null);
  const imgInputRef = useRef(null);

  // Forms
  const emptyProd = { nombre:"", categoria:"Mouse", stock:"", stock_minimo:"5", precio_compra:"", precio_venta:"", descripcion:"", imagen:"" };
  const emptyClient = { nombre:"", cedula:"", telefono:"", email:"", ciudad:"" };
  const emptyVenta = { cliente_id:"", fecha:new Date().toISOString().split("T")[0], items:[], descuento:"0", descuentoModo:"$", descuentoPct:"0", estado:"Pagado", abonoInicial:"0", notas:"" };
  const emptyCompra = { proveedor:"", fecha:new Date().toISOString().split("T")[0], items:[], gastoCourier:"0", notas:"" };
  const emptyCompraItem = { nombre:"", categoria:"Mouse", cantidad:"", costo:"", precio_venta:"", stock_minimo:"5", imagen:"" };
  const emptyDeuda = { cliente_id:"", descripcion:"", monto:"", fecha_vencimiento:"", items:[] };
  const emptyDeudaItem = { producto_id:"", cantidad:"1" };
  const emptyCotizacion = { cliente_id:"", fecha:new Date().toISOString().split("T")[0], validez:"", items:[], descuentoPct:"0", descuento:"0", descuentoModo:"$", notas:"" };
  const emptyAbono = { monto:"", nota:"" };

  const [prodForm, setProdForm] = useState(emptyProd);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [ventaForm, setVentaForm] = useState(emptyVenta);
  const [ventaItem, setVentaItem] = useState({ producto_id:"", cantidad:"1" });
  const [compraForm, setCompraForm] = useState(emptyCompra);
  const [compraItem, setCompraItem] = useState(emptyCompraItem);
  const imgCompraRef = useRef(null);
  const [deudaForm, setDeudaForm] = useState(emptyDeuda);
  const [deudaItem, setDeudaItem] = useState(emptyDeudaItem);
  const [cotForm, setCotForm] = useState(emptyCotizacion);
  const [cotItem, setCotItem] = useState({ producto_id:"", cantidad:"1" });
  const [cotProdSearch, setCotProdSearch] = useState("");
  const [cotClientSearch, setCotClientSearch] = useState("");
  const [ventaClientSearch, setVentaClientSearch] = useState("");
  const [ventaProdSearch, setVentaProdSearch] = useState("");
  const [abonoForm, setAbonoForm] = useState(emptyAbono);

  // Load data
  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      const loaded = s ? JSON.parse(s) : { ...DEMO_DATA };
      if (!loaded.cotizaciones) loaded.cotizaciones = [];
      if (!loaded.categorias) loaded.categorias = [...CATEGORIAS_DEFAULT];
      setData(loaded);
    } catch { setData({ ...DEMO_DATA, cotizaciones: [], categorias: [...CATEGORIAS_DEFAULT] }); }
  }, []);

  // Matrix rain canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = "01NEXUS RD∞∆◈▦◉▲▼◆";
    let raf;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff4120";
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const save = (updated) => {
    setData(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const showNotify = (msg, type = "success") => {
    setNotify({ msg, type });
    setTimeout(() => setNotify(null), 3500);
  };

  if (!data) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#000", color:"#00d4ff", fontFamily:"monospace", fontSize:18 }}>
      <span style={{ animation:"pulse 1s infinite" }}>⬡ INICIANDO NEXUSTORERD...</span>
    </div>
  );

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalVentas = data.ventas.reduce((s,v) => s + v.total, 0);
  const totalCompras = data.compras.reduce((s,c) => s + c.total, 0);
  const margen = totalVentas - totalCompras;
  const margenPct = totalCompras > 0 ? ((margen/totalCompras)*100).toFixed(1) : 0;
  const totalDeudas = data.deudas.filter(d => d.estado !== "Pagado").reduce((s,d) => s + (d.monto - d.monto_pagado), 0);
  const stockBajo = data.productos.filter(p => p.stock <= p.stock_minimo).length;

  const currentYear = new Date().getFullYear();
  const ventasPorMes = MESES.map((m, i) => {
    const valor = data.ventas
      .filter(v => {
        const d = new Date(v.fecha);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      })
      .reduce((s, v) => s + v.total, 0);
    return { mes: m, valor };
  });
  const maxVenta = Math.max(...ventasPorMes.map(v => v.valor), 1);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt = n => new Intl.NumberFormat("es-DO", { style:"currency", currency:"DOP", maximumFractionDigits:0 }).format(n || 0);
  const nextId = arr => arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
  const nextCode = (prefix, arr) => `${prefix}-${String(nextId(arr)).padStart(3,"0")}`;
  const today = () => new Date().toISOString().split("T")[0];

  // ── Categorías dinámicas ───────────────────────────────────────────────────
  const addCategoria = () => {
    const cat = nuevaCat.trim();
    if (!cat) { showNotify("⚠ Escribe el nombre de la categoría","error"); return; }
    if (data.categorias.map(c=>c.toLowerCase()).includes(cat.toLowerCase())) { showNotify("⚠ Esa categoría ya existe","error"); return; }
    const categorias = [...data.categorias, cat];
    save({...data, categorias});
    setProdForm(f => ({...f, categoria: cat}));
    setNuevaCat("");
    showNotify(`✓ Categoría "${cat}" agregada`);
  };

  // ── Imagen de producto ─────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showNotify("⚠ La imagen no debe superar 2MB","error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setProdForm(f => ({...f, imagen: ev.target.result}));
    reader.readAsDataURL(file);
  };

  // ── CRUD Productos ─────────────────────────────────────────────────────────
  const saveProd = () => {
    if (!prodForm.nombre || !prodForm.precio_venta) { showNotify("⚠ Nombre y precio son obligatorios", "error"); return; }
    const isEdit = modal?.editId;
    const item = { ...prodForm, stock:+prodForm.stock||0, stock_minimo:+prodForm.stock_minimo||5, precio_compra:+prodForm.precio_compra||0, precio_venta:+prodForm.precio_venta, estado:"Activo" };
    const prods = isEdit
      ? data.productos.map(p => p.id===isEdit ? {...p,...item} : p)
      : [...data.productos, { id:nextId(data.productos), codigo:nextCode("NX",data.productos), ...item }];
    save({...data, productos:prods});
    showNotify(isEdit ? "✓ Producto actualizado" : "✓ Producto registrado");
    setModal(null);
  };
  const delProd = id => { save({...data, productos:data.productos.filter(p=>p.id!==id)}); showNotify("Eliminado"); setConfirm(null); };

  // ── CRUD Clientes ──────────────────────────────────────────────────────────
  const saveClient = () => {
    if (!clientForm.nombre || !clientForm.telefono) { showNotify("⚠ Nombre y teléfono son obligatorios","error"); return; }
    const isEdit = modal?.editId;
    const clientes = isEdit
      ? data.clientes.map(c => c.id===isEdit ? {...c,...clientForm} : c)
      : [...data.clientes, { id:nextId(data.clientes), ...clientForm, estado:"Activo" }];
    save({...data, clientes});
    showNotify(isEdit ? "✓ Cliente actualizado" : "✓ Cliente registrado");
    setModal(null);
  };
  const delClient = id => { save({...data, clientes:data.clientes.filter(c=>c.id!==id)}); showNotify("Eliminado"); setConfirm(null); };

  // ── CRUD Ventas ────────────────────────────────────────────────────────────
  const addVentaItem = () => {
    const prod = data.productos.find(p => p.id === +ventaItem.producto_id);
    if (!prod) { showNotify("⚠ Selecciona un producto","error"); return; }
    if (+ventaItem.cantidad > prod.stock) { showNotify(`⚠ Stock insuficiente (${prod.stock} disponibles)`,"error"); return; }
    if (+ventaItem.cantidad < 1) { showNotify("⚠ Cantidad inválida","error"); return; }
    setVentaForm(f => ({...f, items:[...f.items, {producto_id:prod.id, nombre:prod.nombre, cantidad:+ventaItem.cantidad, precio:prod.precio_venta}]}));
    setVentaItem({producto_id:"", cantidad:"1"});
  };
  const saveVenta = () => {
    if (!ventaForm.cliente_id || !ventaForm.items.length) { showNotify("⚠ Cliente y productos son obligatorios","error"); return; }
    const cliente = data.clientes.find(c => c.id === +ventaForm.cliente_id);
    const subtotal = ventaForm.items.reduce((s,i) => s + i.cantidad*i.precio, 0);
    const descuento = ventaForm.descuentoModo === "%"
      ? Math.round(subtotal * Math.min(100,Math.max(0,+ventaForm.descuentoPct||0)) / 100)
      : Math.min(+ventaForm.descuento||0, subtotal);
    const total = subtotal - descuento;
    const nuevaVenta = { id:nextId(data.ventas), codigo:nextCode("VTA",data.ventas), ...ventaForm, cliente_id:+ventaForm.cliente_id, cliente_nombre:cliente.nombre, subtotal, descuento, total };
    const prods = data.productos.map(p => {
      const item = ventaForm.items.find(i => i.producto_id===p.id);
      return item ? {...p, stock:p.stock-item.cantidad} : p;
    });
    let deudas = [...data.deudas];
    if (ventaForm.estado === "Pendiente") {
      const abono = Math.min(+ventaForm.abonoInicial||0, total);
      const estadoDeuda = abono >= total ? "Pagado" : abono > 0 ? "Parcial" : "Pendiente";
      deudas.push({
        id:nextId(data.deudas), cliente_id:+ventaForm.cliente_id, cliente_nombre:cliente.nombre,
        descripcion:`${nuevaVenta.codigo} — ${ventaForm.items.map(i=>i.nombre).join(", ")}`,
        monto:total, monto_pagado:abono, fecha_registro:ventaForm.fecha, fecha_vencimiento:"", estado:estadoDeuda
      });
    }
    save({...data, ventas:[...data.ventas, nuevaVenta], productos:prods, deudas});
    showNotify("✓ Venta registrada exitosamente");
    setVentaForm(emptyVenta);
    setVentaClientSearch(""); setVentaProdSearch("");
    setModal(null);
  };
  const delVenta = id => { save({...data, ventas:data.ventas.filter(v=>v.id!==id)}); showNotify("Venta eliminada"); setConfirm(null); };

  // ── CRUD Compras ───────────────────────────────────────────────────────────
  const addCompraItem = () => {
    if (!compraItem.nombre || !compraItem.cantidad || !compraItem.costo) { showNotify("⚠ Nombre, cantidad y costo son obligatorios","error"); return; }
    if (!compraItem.precio_venta) { showNotify("⚠ El precio de venta es obligatorio para registrar en inventario","error"); return; }
    setCompraForm(f => ({...f, items:[...f.items, {...compraItem, cantidad:+compraItem.cantidad, costo:+compraItem.costo, precio_venta:+compraItem.precio_venta, stock_minimo:+compraItem.stock_minimo||5}]}));
    setCompraItem(emptyCompraItem);
  };

  const handleCompraImgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { showNotify("⚠ La imagen no debe superar 2MB","error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCompraItem(f=>({...f,imagen:ev.target.result}));
    reader.readAsDataURL(file);
  };

  const saveCompra = () => {
    if (!compraForm.proveedor || !compraForm.items.length) { showNotify("⚠ Proveedor y productos son obligatorios","error"); return; }
    const isEdit = modal?.editId;
    const subtotalProductos = compraForm.items.reduce((s,i) => s + i.cantidad*i.costo, 0);
    const gastoCourier = +compraForm.gastoCourier||0;
    const total = subtotalProductos + gastoCourier;

    if (isEdit) {
      const compras = data.compras.map(c => c.id===isEdit ? {...c,...compraForm,subtotalProductos,gastoCourier,total} : c);
      save({...data, compras});
      showNotify("✓ Compra actualizada");
    } else {
      const nueva = { id:nextId(data.compras), codigo:nextCode("CMP",data.compras), ...compraForm, subtotalProductos, gastoCourier, total };
      // Actualizar o crear productos en inventario
      let productos = [...data.productos];
      compraForm.items.forEach(item => {
        const existeIdx = productos.findIndex(p => p.nombre.toLowerCase()===item.nombre.toLowerCase());
        if (existeIdx >= 0) {
          // Actualizar stock y precio de compra existente
          productos[existeIdx] = {
            ...productos[existeIdx],
            stock: productos[existeIdx].stock + item.cantidad,
            precio_compra: item.costo,
            precio_venta: item.precio_venta || productos[existeIdx].precio_venta,
            stock_minimo: item.stock_minimo || productos[existeIdx].stock_minimo,
            categoria: item.categoria || productos[existeIdx].categoria,
            imagen: item.imagen || productos[existeIdx].imagen,
          };
        } else {
          // Crear producto nuevo en inventario
          const newId = nextId(productos);
          productos.push({
            id: newId,
            codigo: nextCode("NX", productos),
            nombre: item.nombre,
            categoria: item.categoria || "Otro",
            stock: item.cantidad,
            stock_minimo: item.stock_minimo || 5,
            precio_compra: item.costo,
            precio_venta: item.precio_venta,
            imagen: item.imagen || "",
            estado: "Activo",
          });
        }
      });
      save({...data, compras:[...data.compras, nueva], productos});
      showNotify("✓ Compra registrada e inventario actualizado");
    }
    setCompraForm(emptyCompra);
    setCompraItem(emptyCompraItem);
    setModal(null);
  };
  const delCompra = id => {
    const compra = data.compras.find(c => c.id===id);
    if (!compra) { setConfirm(null); return; }
    // Revertir stock del inventario y eliminar productos con stock 0 o menos
    let productos = [...data.productos];
    (compra.items||[]).forEach(item => {
      const idx = productos.findIndex(p => p.nombre.toLowerCase()===item.nombre.toLowerCase());
      if (idx >= 0) {
        const nuevoStock = productos[idx].stock - item.cantidad;
        if (nuevoStock <= 0) {
          // Eliminar producto del inventario si su stock llega a 0
          productos.splice(idx, 1);
        } else {
          productos[idx] = { ...productos[idx], stock: nuevoStock };
        }
      }
    });
    const compras = data.compras.filter(c => c.id!==id);
    save({...data, compras, productos});
    showNotify("✓ Compra eliminada e inventario revertido");
    setConfirm(null);
  };

  // ── CRUD Deudas + ABONOS ───────────────────────────────────────────────────
  const addDeudaItem = () => {
    const prod = data.productos.find(p => p.id === +deudaItem.producto_id);
    if (!prod) { showNotify("⚠ Selecciona un producto","error"); return; }
    const cant = +deudaItem.cantidad;
    if (cant < 1) { showNotify("⚠ Cantidad inválida","error"); return; }
    if (cant > prod.stock) { showNotify(`⚠ Stock insuficiente (${prod.stock} disponibles)`,"error"); return; }
    setDeudaForm(f => ({
      ...f,
      items:[...f.items, { producto_id:prod.id, nombre:prod.nombre, cantidad:cant, precio:prod.precio_venta }],
      monto: String(f.items.reduce((s,i)=>s+i.cantidad*i.precio,0) + cant*prod.precio_venta),
      descripcion: f.descripcion || prod.nombre,
    }));
    setDeudaItem({ producto_id:"", cantidad:"1" });
  };

  const removeDeudaItem = (idx) => {
    setDeudaForm(f => {
      const items = f.items.filter((_,i) => i !== idx);
      return { ...f, items, monto: String(items.reduce((s,i)=>s+i.cantidad*i.precio,0)) };
    });
  };

  const saveDeuda = () => {
    if (!deudaForm.cliente_id || !deudaForm.items.length) { showNotify("⚠ Cliente y al menos un producto son obligatorios","error"); return; }
    const cliente = data.clientes.find(c => c.id===+deudaForm.cliente_id);
    const monto = deudaForm.items.reduce((s,i)=>s+i.cantidad*i.precio,0);
    const descripcion = deudaForm.descripcion || deudaForm.items.map(i=>i.nombre).join(", ");
    // Descontar stock
    const productos = data.productos.map(p => {
      const item = deudaForm.items.find(i => i.producto_id === p.id);
      return item ? { ...p, stock: p.stock - item.cantidad } : p;
    });
    const nueva = {
      id:nextId(data.deudas),
      cliente_id:+deudaForm.cliente_id,
      cliente_nombre:cliente.nombre,
      descripcion,
      items: deudaForm.items,
      monto,
      monto_pagado:0,
      fecha_registro:today(),
      fecha_vencimiento:deudaForm.fecha_vencimiento||"",
      estado:"Pendiente"
    };
    save({...data, deudas:[...data.deudas, nueva], productos});
    showNotify("✓ Deuda registrada y stock actualizado");
    setDeudaForm(emptyDeuda);
    setDeudaItem(emptyDeudaItem);
    setModal(null);
  };
  const pagarDeuda = id => {
    const deuda = data.deudas.find(d => d.id===id);
    const deudas = data.deudas.map(d => d.id===id ? {...d, estado:"Pagado", monto_pagado:d.monto} : d);
    // Sincronizar venta relacionada a Pagado
    const ventas = data.ventas.map(v => {
      if (v.cliente_id===deuda.cliente_id && v.estado==="Pendiente" && deuda.descripcion.includes(v.codigo)) {
        return {...v, estado:"Pagado"};
      }
      return v;
    });
    save({...data, deudas, ventas});
    showNotify("✓ Deuda pagada y venta actualizada");
  };

  const saveEditDeuda = (deudaId) => {
    const monto = +abonoForm.monto;
    if (!monto || monto <= 0) { showNotify("⚠ Ingresa un monto válido","error"); return; }
    const deuda = data.deudas.find(d => d.id===deudaId);
    const nuevoPagado = Math.min(monto, deuda.monto);
    const nuevoEstado = nuevoPagado >= deuda.monto ? "Pagado" : nuevoPagado > 0 ? "Parcial" : "Pendiente";
    // Sincronizar venta si cambia a Pagado
    const ventas = data.ventas.map(v => {
      if (v.cliente_id===deuda.cliente_id && deuda.descripcion.includes(v.codigo)) {
        return {...v, estado: nuevoEstado==="Pagado" ? "Pagado" : "Pendiente"};
      }
      return v;
    });
    const deudas = data.deudas.map(d => d.id===deudaId ? {...d, monto_pagado:nuevoPagado, estado:nuevoEstado} : d);
    save({...data, deudas, ventas});
    showNotify("✓ Deuda actualizada");
    setAbonoForm(emptyAbono);
    setModal(null);
  };
  const saveAbono = (deudaId) => {
    const monto = +abonoForm.monto;
    const deuda = data.deudas.find(d => d.id === deudaId);
    const pendiente = deuda.monto - deuda.monto_pagado;
    if (!monto || monto <= 0) { showNotify("⚠ Ingresa un monto válido","error"); return; }
    if (monto > pendiente) { showNotify(`⚠ El abono supera el pendiente (${fmt(pendiente)})`,"error"); return; }
    const nuevoPagado = deuda.monto_pagado + monto;
    const nuevoEstado = nuevoPagado >= deuda.monto ? "Pagado" : "Parcial";
    const deudas = data.deudas.map(d => d.id===deudaId ? {...d, monto_pagado:nuevoPagado, estado:nuevoEstado} : d);
    save({...data, deudas});
    showNotify(`✓ Abono de ${fmt(monto)} registrado`);
    setAbonoForm(emptyAbono);
    setModal(null);
  };
  const delDeuda = id => { save({...data, deudas:data.deudas.filter(d=>d.id!==id)}); showNotify("Eliminada"); setConfirm(null); };

  // ── CRUD Cotizaciones ──────────────────────────────────────────────────────
  const addCotItem = () => {
    const prod = data.productos.find(p => p.id === +cotItem.producto_id);
    if (!prod) { showNotify("⚠ Selecciona un producto","error"); return; }
    if (+cotItem.cantidad < 1) { showNotify("⚠ Cantidad inválida","error"); return; }
    setCotForm(f => ({...f, items:[...f.items, {producto_id:prod.id, nombre:prod.nombre, cantidad:+cotItem.cantidad, precio:prod.precio_venta}]}));
    setCotItem({producto_id:"", cantidad:"1"});
  };
  const saveCotizacion = () => {
    if (!cotForm.cliente_id || !cotForm.items.length) { showNotify("⚠ Cliente y productos son obligatorios","error"); return; }
    const cliente = data.clientes.find(c => c.id === +cotForm.cliente_id);
    const subtotal = cotForm.items.reduce((s,i) => s + i.cantidad*i.precio, 0);
    const pct = cotForm.descuentoModo === "%" ? Math.min(100, Math.max(0, +cotForm.descuentoPct||0)) : 0;
    const descuento = cotForm.descuentoModo === "%"
      ? Math.round(subtotal * pct / 100)
      : Math.min(+cotForm.descuento||0, subtotal);
    const total = subtotal - descuento;
    const nueva = {
      id:nextId(data.cotizaciones), codigo:nextCode("COT",data.cotizaciones),
      ...cotForm, cliente_id:+cotForm.cliente_id, cliente_nombre:cliente.nombre,
      cliente_telefono:cliente.telefono, cliente_email:cliente.email||"",
      subtotal, descuentoPct: cotForm.descuentoModo==="%"?pct:0, descuento, total, estado:"Vigente"
    };
    save({...data, cotizaciones:[...data.cotizaciones, nueva]});
    showNotify("✓ Cotización guardada");
    setCotForm(emptyCotizacion);
    setModal(null);
  };
  const delCotizacion = id => { save({...data, cotizaciones:data.cotizaciones.filter(c=>c.id!==id)}); showNotify("Eliminada"); setConfirm(null); };

  // ── Export PDF Cotización ──────────────────────────────────────────────────
  const exportCotizacionPDF = (cotId) => {
    const c = data.cotizaciones.find(x => x.id === cotId);
    if (!c) return;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Cotización ${c.codigo}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#222;padding:40px;font-size:14px;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:3px solid #6d28d9;}
      .logo{font-size:28px;font-weight:900;color:#6d28d9;letter-spacing:2px;}
      .logo span{color:#f97316;}
      .logo-sub{font-size:11px;color:#999;letter-spacing:3px;margin-top:2px;}
      .cod-box{background:#f3f0ff;border:1px solid #c4b5fd;border-radius:8px;padding:12px 20px;text-align:right;}
      .cod-num{font-size:22px;font-weight:900;color:#6d28d9;}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:36px;}
      .info-box{background:#fafafa;border-radius:8px;padding:16px 20px;}
      .info-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0;}
      .info-row:last-child{border:none;}
      .section-title{font-size:11px;font-weight:700;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
      table{width:100%;border-collapse:collapse;margin-bottom:24px;}
      th{background:#6d28d9;color:#fff;padding:10px 14px;text-align:left;font-size:12px;letter-spacing:1px;}
      th:last-child,td:last-child{text-align:right;}
      tr:nth-child(even){background:#f9f7ff;}
      td{padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0;}
      .totals{margin-left:auto;width:300px;}
      .total-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;}
      .total-final{display:flex;justify-content:space-between;padding:14px 0 0;font-size:18px;font-weight:900;color:#6d28d9;border-top:2px solid #6d28d9;margin-top:4px;}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;text-align:center;font-size:12px;color:#bbb;}
      .notes{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#92400e;}
      @media print{.no-print{display:none!important;}}
    </style></head><body>
    <div class="no-print" style="text-align:center;margin-bottom:20px;">
      <button onclick="window.print()" style="background:#6d28d9;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:700;margin-right:10px;">🖨️ IMPRIMIR / GUARDAR PDF</button>
      <button onclick="window.close()" style="background:#f3f4f6;color:#555;border:1px solid #ddd;padding:10px 20px;border-radius:6px;font-size:14px;cursor:pointer;">CERRAR</button>
    </div>
    <div class="header">
      <div>
        <div class="logo">NEXU<span>STORE</span> <span style="color:#f97316;">RD</span></div>
        <div class="logo-sub">ACCESORIOS DE PC</div>
        <div style="font-size:12px;color:#999;margin-top:8px;">Santo Domingo, República Dominicana</div>
      </div>
      <div class="cod-box">
        <div style="font-size:11px;color:#999;">COTIZACIÓN N°</div>
        <div class="cod-num">${c.codigo}</div>
        <div style="font-size:12px;color:#999;margin-top:4px;">Estado: <strong style="color:#6d28d9;">${c.estado}</strong></div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-box">
        <div class="section-title">📋 Datos de la cotización</div>
        <div class="info-row"><span style="color:#999;">Fecha emisión</span><strong>${c.fecha}</strong></div>
        <div class="info-row"><span style="color:#999;">Válida hasta</span><strong>${c.validez||"—"}</strong></div>
        <div class="info-row"><span style="color:#999;">Código</span><strong>${c.codigo}</strong></div>
      </div>
      <div class="info-box">
        <div class="section-title">👤 Cliente</div>
        <div class="info-row"><span style="color:#999;">Nombre</span><strong>${c.cliente_nombre}</strong></div>
        <div class="info-row"><span style="color:#999;">Teléfono</span><strong>${c.cliente_telefono||"—"}</strong></div>
        <div class="info-row"><span style="color:#999;">Correo</span><strong>${c.cliente_email||"—"}</strong></div>
      </div>
    </div>
    ${c.notas ? `<div class="notes">📌 <strong>Notas:</strong> ${c.notas}</div>` : ""}
    <div class="section-title" style="margin-bottom:12px;">🛒 Productos cotizados</div>
    <table>
      <thead><tr><th>#</th><th>PRODUCTO</th><th>PRECIO UNIT.</th><th>CANT.</th><th>SUBTOTAL</th></tr></thead>
      <tbody>
        ${c.items.map((item,i) => `<tr>
          <td>${i+1}</td><td>${item.nombre}</td>
          <td style="text-align:right;">${new Intl.NumberFormat("es-DO",{style:"currency",currency:"DOP",maximumFractionDigits:0}).format(item.precio)}</td>
          <td style="text-align:center;">${item.cantidad}</td>
          <td>${new Intl.NumberFormat("es-DO",{style:"currency",currency:"DOP",maximumFractionDigits:0}).format(item.cantidad*item.precio)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span style="color:#999;">Subtotal</span><span>${new Intl.NumberFormat("es-DO",{style:"currency",currency:"DOP",maximumFractionDigits:0}).format(c.subtotal)}</span></div>
      ${c.descuento>0 ? `<div class="total-row"><span style="color:#999;">Descuento (${c.descuentoPct||0}%)</span><span style="color:#ef4444;">- ${new Intl.NumberFormat("es-DO",{style:"currency",currency:"DOP",maximumFractionDigits:0}).format(c.descuento)}</span></div>` : ""}
      <div class="total-final"><span>TOTAL</span><span>${new Intl.NumberFormat("es-DO",{style:"currency",currency:"DOP",maximumFractionDigits:0}).format(c.total)}</span></div>
    </div>
    <div class="footer">
      <p><strong>NexuStoreRD</strong> — Accesorios de PC | Santo Domingo, República Dominicana</p>
      <p style="margin-top:4px;">Esta cotización es válida hasta ${c.validez||"la fecha indicada"} · Precios en pesos dominicanos (DOP)</p>
    </div>
    </body></html>`);
    w.document.close();
  };

  // ── Nav ────────────────────────────────────────────────────────────────────
  const NAV = [
    { id:"dashboard",    icon:"◈",  label:"Dashboard" },
    { id:"inventario",   icon:"▦",  label:"Inventario" },
    { id:"clientes",     icon:"◉",  label:"Clientes" },
    { id:"ventas",       icon:"▲",  label:"Ventas" },
    { id:"compras",      icon:"▼",  label:"Compras" },
    { id:"deudas",       icon:"◆",  label:"Deudas" },
    { id:"cotizaciones", icon:"📋", label:"Cotizaciones" },
    { id:"ganancias",    icon:"◎",  label:"Ganancias" },
  ];

  const filteredProds = data.productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todas" || p.categoria.toLowerCase().includes(catFilter.toLowerCase());
    return matchSearch && matchCat;
  });
  const filteredClients  = data.clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()) || (c.cedula||"").includes(search));

  return (
    <div style={{ fontFamily:"'Share Tech Mono','Courier New',monospace", minHeight:"100vh", background:"#000", color:"#e0e0e0", display:"flex", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#050505;}
        ::-webkit-scrollbar-thumb{background:#00d4ff40;border-radius:2px;}
        ::-webkit-scrollbar-thumb:hover{background:#00d4ff;}
        input,select,textarea{font-family:'Share Tech Mono',monospace!important;}
        input::placeholder,textarea::placeholder{color:#333;}
        select option{background:#0a0a0a;color:#e0e0e0;}
        @keyframes neonPulse{0%,100%{text-shadow:0 0 5px #00d4ff,0 0 10px #00d4ff,0 0 20px #00d4ff}50%{text-shadow:0 0 2px #00d4ff,0 0 5px #00d4ff}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes glitch{0%,100%{transform:translate(0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}60%{transform:translate(-1px,2px)}80%{transform:translate(1px,-2px)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes borderGlow{0%,100%{border-color:#00d4ff40}50%{border-color:#00d4ff}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        .nav-item{transition:all .2s;}
        .nav-item:hover{background:#00d4ff15!important;color:#00d4ff!important;padding-left:20px!important;}
        .card-hover{transition:all .2s;}
        .card-hover:hover{border-color:#00d4ff60!important;transform:translateY(-2px);box-shadow:0 8px 30px #00d4ff15!important;}
        .btn-glow:hover{box-shadow:0 0 20px currentColor!important;transform:translateY(-2px);}
        .row-hover:hover{background:#00d4ff08!important;}
        .neon-text{animation:neonPulse 3s ease-in-out infinite;}
        .glitch{animation:glitch .2s ease-in-out;}
        .fade-in{animation:fadeInUp .4s ease-out;}
        .slide-in{animation:slideIn .3s ease-out;}
        .scanline{position:absolute;width:100%;height:2px;background:linear-gradient(transparent,#00d4ff08,transparent);animation:scanline 8s linear infinite;pointer-events:none;z-index:1;}
        .border-glow{animation:borderGlow 3s ease-in-out infinite;}
      `}</style>

      <canvas ref={canvasRef} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", opacity:.03, pointerEvents:"none", zIndex:0 }} />
      <div className="scanline" />

      {/* Notification */}
      {notify && (
        <div className="slide-in" style={{ position:"fixed", bottom:24, right:24, zIndex:999, padding:"14px 24px", borderRadius:4, fontWeight:700, fontSize:13, letterSpacing:1, background:notify.type==="error"?"#ff3d5720":"#00d4ff15", color:notify.type==="error"?"#ff3d57":"#00d4ff", border:`1px solid ${notify.type==="error"?"#ff3d57":"#00d4ff"}`, boxShadow:`0 0 20px ${notify.type==="error"?"#ff3d5740":"#00d4ff40"}` }}>
          {notify.msg}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.9)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
          <div className="fade-in" style={{ background:"#050505", border:"1px solid #ff3d57", borderRadius:8, padding:36, maxWidth:380, width:"90%", textAlign:"center", boxShadow:"0 0 40px #ff3d5730" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>⚠</div>
            <h3 style={{ color:"#ff3d57", marginBottom:12, fontFamily:"Orbitron,monospace", fontSize:16 }}>{confirm.title}</h3>
            <p style={{ color:"#666", marginBottom:28, fontSize:13 }}>{confirm.msg}</p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button className="btn-glow" style={{ background:"#ff3d5720", color:"#ff3d57", border:"1px solid #ff3d57", padding:"10px 24px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, letterSpacing:1 }} onClick={confirm.onConfirm}>CONFIRMAR</button>
              <button className="btn-glow" style={{ background:"transparent", color:"#00d4ff", border:"1px solid #00d4ff40", padding:"10px 24px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:13 }} onClick={()=>setConfirm(null)}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR ═══════════════════════════════════════════════════════ */}
      <div style={{ width:230, background:"#050505", borderRight:"1px solid #00d4ff20", padding:"0 0 24px", display:"flex", flexDirection:"column", position:"relative", zIndex:10, flexShrink:0 }}>
        <div style={{ padding:"28px 20px 24px", borderBottom:"1px solid #00d4ff15", marginBottom:12 }}>
          <div className={glitch?"glitch":""} style={{ fontFamily:"Orbitron,monospace", fontSize:20, fontWeight:900, color:"#00d4ff", letterSpacing:3, lineHeight:1.1 }}>
            NEXU<span style={{ color:"#ff6b35" }}>STORE</span>
          </div>
          <div style={{ color:"#ff6b35", fontSize:11, letterSpacing:4, marginTop:4, fontWeight:700 }}>RD</div>
          <div style={{ fontSize:10, color:"#333", marginTop:6, letterSpacing:1 }}>SISTEMA DE GESTIÓN v4.9</div>
        </div>
        <div style={{ padding:"0 12px", flex:1 }}>
          {NAV.map(item => (
            <div key={item.id} className="nav-item" style={{ padding:"11px 16px", borderRadius:4, cursor:"pointer", fontSize:12, fontWeight:700, letterSpacing:2, color:view===item.id?"#000":"#444", background:view===item.id?"#00d4ff":"transparent", display:"flex", alignItems:"center", gap:12, marginBottom:2, borderLeft:view===item.id?"3px solid #00d4ff":"3px solid transparent", textTransform:"uppercase" }}
              onClick={() => { setView(item.id); setSearch(""); }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>{item.label}
            </div>
          ))}
        </div>
        <div style={{ padding:"16px 20px 0", borderTop:"1px solid #00d4ff10" }}>
          {stockBajo > 0 && (
            <div style={{ background:"#ff3d5715", border:"1px solid #ff3d5740", borderRadius:4, padding:"8px 12px", fontSize:11, color:"#ff3d57", letterSpacing:.5, marginBottom:10, textAlign:"center" }}>
              ⚠ {stockBajo} PRODUCTO{stockBajo>1?"S":""} STOCK BAJO
            </div>
          )}
          <div style={{ fontSize:10, color:"#222", textAlign:"center", letterSpacing:1 }}>© 2025 NEXUSTORERD</div>
          <div style={{ fontSize:10, color:"#1a1a1a", textAlign:"center" }}>by Jeffrey Vargas</div>
        </div>
      </div>

      {/* ═══ MAIN ══════════════════════════════════════════════════════════ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative", zIndex:5 }}>
        {/* Header */}
        <div style={{ background:"#050505", borderBottom:"1px solid #00d4ff15", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h1 className="neon-text" style={{ fontFamily:"Orbitron,monospace", fontSize:18, fontWeight:900, color:"#00d4ff", letterSpacing:3, textTransform:"uppercase" }}>
              {NAV.find(n=>n.id===view)?.icon} {NAV.find(n=>n.id===view)?.label}
            </h1>
            <div style={{ fontSize:10, color:"#333", marginTop:3, letterSpacing:2 }}>
              {new Date().toLocaleDateString("es-DO",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).toUpperCase()}
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {view==="inventario"   && <Btn color="#00d4ff" onClick={()=>{setProdForm(emptyProd);setModal({type:"prod"});}}>＋ PRODUCTO</Btn>}
            {view==="clientes"     && <Btn color="#00d4ff" onClick={()=>{setClientForm(emptyClient);setModal({type:"client"});}}>＋ CLIENTE</Btn>}
            {view==="ventas"       && <Btn color="#00e676" onClick={()=>{setVentaForm(emptyVenta);setVentaClientSearch("");setVentaProdSearch("");setModal({type:"venta"});}}>＋ VENTA</Btn>}
            {view==="compras"      && <Btn color="#ff6b35" onClick={()=>{setCompraForm(emptyCompra);setModal({type:"compra"});}}>＋ COMPRA</Btn>}
            {view==="deudas"       && <Btn color="#ff3d57" onClick={()=>{setDeudaForm(emptyDeuda);setDeudaItem(emptyDeudaItem);setModal({type:"deuda"});}}>＋ DEUDA</Btn>}
            {view==="cotizaciones" && <Btn color="#a78bfa" onClick={()=>{setCotForm(emptyCotizacion);setCotProdSearch("");setCotClientSearch("");setModal({type:"cotizacion"});}}>＋ COTIZACIÓN</Btn>}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>

          {/* ── DASHBOARD ─────────────────────────────────────────────── */}
          {view==="dashboard" && (
            <div className="fade-in">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
                {[
                  { label:"VENTAS TOTALES",  value:fmt(totalVentas),  icon:"▲", color:"#00e676", sub:`${data.ventas.length} transacciones` },
                  { label:"COMPRAS TOTALES", value:fmt(totalCompras), icon:"▼", color:"#ff6b35", sub:`${data.compras.length} órdenes` },
                  { label:"MARGEN BRUTO",    value:fmt(margen),       icon:"◎", color:"#00d4ff", sub:`${margenPct}% rentabilidad` },
                  { label:"DEUDAS ACTIVAS",  value:fmt(totalDeudas),  icon:"◆", color:"#ff3d57", sub:`${data.deudas.filter(d=>d.estado!=="Pagado").length} clientes` },
                ].map((s,i) => (
                  <div key={i} className="card-hover" style={{ background:"#080808", border:`1px solid ${s.color}30`, borderTop:`2px solid ${s.color}`, borderRadius:6, padding:"20px 22px", boxShadow:`0 4px 20px ${s.color}10` }}>
                    <div style={{ fontSize:24, color:s.color, marginBottom:10 }}>{s.icon}</div>
                    <div style={{ fontFamily:"Orbitron,monospace", fontSize:18, fontWeight:900, color:s.color, letterSpacing:1 }}>{s.value}</div>
                    <div style={{ fontSize:10, color:"#444", marginTop:6, letterSpacing:1.5 }}>{s.label}</div>
                    <div style={{ fontSize:10, color:"#333", marginTop:3 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16, marginBottom:16 }}>
                <div className="card-hover border-glow" style={{ background:"#080808", border:"1px solid #00d4ff20", borderRadius:6, padding:"24px" }}>
                  <div style={{ fontFamily:"Orbitron,monospace", fontSize:11, color:"#00d4ff", letterSpacing:2, marginBottom:20 }}>◈ VENTAS POR MES — {`${currentYear}`}</div>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:120 }}>
                    {ventasPorMes.map((v,i) => {
                      const h = maxVenta > 0 ? (v.valor/maxVenta)*100 : 0;
                      return (
                        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                          <div style={{ width:"100%", height:`${h}%`, minHeight:2, background:v.valor>0?"linear-gradient(to top,#00d4ff,#00d4ff60)":"#1a1a1a", borderRadius:"2px 2px 0 0", position:"relative" }}>
                            {v.valor>0 && <div style={{ position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)", fontSize:8, color:"#00d4ff", whiteSpace:"nowrap" }}>{fmt(v.valor/1000)}K</div>}
                          </div>
                          <div style={{ fontSize:8, color:"#333", letterSpacing:.5 }}>{v.mes}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="card-hover" style={{ background:"#080808", border:"1px solid #00e67620", borderRadius:6, padding:"24px" }}>
                  <div style={{ fontFamily:"Orbitron,monospace", fontSize:11, color:"#00e676", letterSpacing:2, marginBottom:16 }}>▲ ÚLTIMAS VENTAS</div>
                  {[...data.ventas].reverse().slice(0,4).map(v => (
                    <div key={v.id} className="row-hover" style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #ffffff08" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#ccc" }}>{v.cliente_nombre}</div>
                        <div style={{ fontSize:10, color:"#333" }}>{v.codigo} • {v.fecha}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ color:"#00e676", fontWeight:900, fontSize:13 }}>{fmt(v.total)}</div>
                        <Tag color={v.estado==="Pagado"?"#00e676":"#ff3d57"}>{v.estado}</Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-hover" style={{ background:"#080808", border:"1px solid #ff3d5730", borderRadius:6, padding:"20px 24px" }}>
                <div style={{ fontFamily:"Orbitron,monospace", fontSize:11, color:"#ff3d57", letterSpacing:2, marginBottom:16 }}>⚠ ALERTAS DE INVENTARIO</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10 }}>
                  {data.productos.filter(p=>p.stock<=p.stock_minimo).map(p => (
                    <div key={p.id} style={{ background:"#ff3d5710", border:"1px solid #ff3d5730", borderRadius:4, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:12 }}>{p.nombre}</div>
                      <Tag color="#ff3d57">{p.stock} und</Tag>
                    </div>
                  ))}
                  {!stockBajo && <div style={{ color:"#333", fontSize:13 }}>✓ Todo el inventario está en orden</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── INVENTARIO ────────────────────────────────────────────── */}
          {view==="inventario" && (
            <div className="fade-in">
              {/* Barra doble: buscador producto + buscador/selector categoría */}
              <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"stretch" }}>
                {/* Buscador producto */}
                <div style={{ position:"relative", flex:1 }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#00d4ff", fontSize:12, pointerEvents:"none" }}>◈</span>
                  <input
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                    placeholder="Buscar producto o código..."
                    style={{ width:"100%", padding:"10px 14px 10px 30px", border:"1px solid #00d4ff20", borderRadius:4, fontSize:12, fontFamily:"inherit", background:"#080808", color:"#e0e0e0", outline:"none", letterSpacing:.5 }}
                  />
                </div>
                {/* Buscador + selector de categoría combinado */}
                <div style={{ position:"relative", flex:1 }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color: catFilter==="Todas"?"#444":"#00d4ff", fontSize:12, pointerEvents:"none" }}>▦</span>
                  <input
                    list="cat-list"
                    value={catFilter==="Todas" ? "" : catFilter}
                    onChange={e=>{
                      const v = e.target.value.trim();
                      const match = (data.categorias||[]).find(c=>c.toLowerCase()===v.toLowerCase());
                      setCatFilter(match ? match : v===""?"Todas":v);
                    }}
                    placeholder="Filtrar por categoría..."
                    style={{ width:"100%", padding:"10px 36px 10px 30px", border:`1px solid ${catFilter!=="Todas"?"#00d4ff40":"#00d4ff20"}`, borderRadius:4, fontSize:12, fontFamily:"inherit", background:"#080808", color: catFilter==="Todas"?"#e0e0e0":"#00d4ff", outline:"none", letterSpacing:.5 }}
                  />
                  <datalist id="cat-list">
                    {(data.categorias||[]).map(cat=><option key={cat} value={cat}/>)}
                  </datalist>
                  {catFilter !== "Todas" && (
                    <button onClick={()=>setCatFilter("Todas")}
                      style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#ff3d57", cursor:"pointer", fontSize:14, lineHeight:1, padding:2 }}>✕</button>
                  )}
                </div>
              </div>
              <Table headers={["CÓDIGO","PRODUCTO","CATEGORÍA","STOCK","P.COMPRA","P.VENTA","MARGEN","ACCIONES"]}>
                {filteredProds.map(p => {
                  const m = p.precio_compra>0 ? (((p.precio_venta-p.precio_compra)/p.precio_compra)*100).toFixed(0) : "N/A";
                  return (
                    <tr key={p.id} className="row-hover">
                      <TD color="#00d4ff">{p.codigo}</TD>
                      <TD><span style={{fontWeight:700}}>{p.nombre}</span></TD>
                      <TD><Tag color="#00d4ff">{p.categoria}</Tag></TD>
                      <TD><Tag color={p.stock<=p.stock_minimo?"#ff3d57":"#00e676"}>{p.stock}</Tag></TD>
                      <TD>{fmt(p.precio_compra)}</TD>
                      <TD color="#00e676"><strong>{fmt(p.precio_venta)}</strong></TD>
                      <TD color="#ffd600"><strong>{m}%</strong></TD>
                      <TD>
                        {p.imagen && (
                          <><BtnSm color="#00d4ff" onClick={()=>setModal({type:"verImg", prod:p})}>VER</BtnSm>{" "}</>
                        )}
                        <BtnSm color="#ffd600" onClick={()=>{setProdForm({nombre:p.nombre,categoria:p.categoria,stock:p.stock,stock_minimo:p.stock_minimo,precio_compra:p.precio_compra,precio_venta:p.precio_venta,descripcion:p.descripcion||"",imagen:p.imagen||""});setModal({type:"prod",editId:p.id});}}>EDITAR</BtnSm>
                        {" "}
                        <BtnSm color="#ff3d57" onClick={()=>setConfirm({title:"¿ELIMINAR PRODUCTO?",msg:`"${p.nombre}" será eliminado permanentemente.`,onConfirm:()=>delProd(p.id)})}>DEL</BtnSm>
                      </TD>
                    </tr>
                  );
                })}
              </Table>
            </div>
          )}

          {/* ── CLIENTES ──────────────────────────────────────────────── */}
          {view==="clientes" && (
            <div className="fade-in">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente o cédula..." />
              <Table headers={["#","NOMBRE","CÉDULA","TELÉFONO","CORREO","CIUDAD","ACCIONES"]}>
                {filteredClients.map(c => (
                  <tr key={c.id} className="row-hover">
                    <TD color="#00d4ff">{String(c.id).padStart(3,"0")}</TD>
                    <TD><strong>{c.nombre}</strong></TD>
                    <TD>{c.cedula||"—"}</TD>
                    <TD>{c.telefono}</TD>
                    <TD color="#444">{c.email||"—"}</TD>
                    <TD>{c.ciudad||"—"}</TD>
                    <TD>
                      <BtnSm color="#ffd600" onClick={()=>{setClientForm({nombre:c.nombre,cedula:c.cedula||"",telefono:c.telefono,email:c.email||"",ciudad:c.ciudad||""});setModal({type:"client",editId:c.id});}}>EDITAR</BtnSm>
                      {" "}
                      <BtnSm color="#ff3d57" onClick={()=>setConfirm({title:"¿ELIMINAR CLIENTE?",msg:`"${c.nombre}" será eliminado.`,onConfirm:()=>delClient(c.id)})}>DEL</BtnSm>
                    </TD>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* ── VENTAS ────────────────────────────────────────────────── */}
          {view==="ventas" && (
            <div className="fade-in">
              <Table headers={["CÓDIGO","CLIENTE","FECHA","PRODUCTOS","DESCUENTO","TOTAL","ESTADO","ACCIONES"]}>
                {[...data.ventas].reverse().map(v => {
                  const prodConImg = v.items?.some(i => data.productos.find(p=>p.id===i.producto_id&&p.imagen));
                  return (
                    <tr key={v.id} className="row-hover">
                      <TD color="#00e676">{v.codigo}</TD>
                      <TD><strong>{v.cliente_nombre}</strong></TD>
                      <TD>{v.fecha}</TD>
                      <TD color="#666">{v.items?.map(i=>`${i.nombre}(${i.cantidad})`).join(", ")}</TD>
                      <TD color="#ff6b35">{fmt(v.descuento||0)}</TD>
                      <TD color="#00e676"><strong>{fmt(v.total)}</strong></TD>
                      <TD><Tag color={v.estado==="Pagado"?"#00e676":v.estado==="Anulado"?"#666":"#ff3d57"}>{v.estado}</Tag></TD>
                      <TD>
                        {prodConImg && (
                          <><BtnSm color="#00d4ff" onClick={()=>setModal({type:"verVenta", venta:v})}>VER</BtnSm>{" "}</>
                        )}
                        <BtnSm color="#ffd600" onClick={()=>setModal({type:"editVenta", venta:v})}>EDITAR</BtnSm>
                        {" "}
                        <BtnSm color="#ff3d57" onClick={()=>setConfirm({title:"¿ELIMINAR VENTA?",msg:"Esta venta será eliminada permanentemente.",onConfirm:()=>delVenta(v.id)})}>DEL</BtnSm>
                      </TD>
                    </tr>
                  );
                })}
              </Table>
            </div>
          )}

          {/* ── COMPRAS ───────────────────────────────────────────────── */}
          {view==="compras" && (
            <div className="fade-in">
              <Table headers={["CÓDIGO","PROVEEDOR","FECHA","PRODUCTOS","CANT.","COSTO","COURIER","TOTAL","GANANCIA EST.","ACCIONES"]}>
                {data.compras.length===0 && <tr><td colSpan={10} style={{padding:40,textAlign:"center",color:"#333",fontSize:13}}>SIN COMPRAS REGISTRADAS</td></tr>}
                {[...data.compras].reverse().map(c => {
                  const subtProd = c.items?.reduce((s,i)=>s+(i.cantidad*i.costo),0)||0;
                  const subtVenta = c.items?.reduce((s,i)=>s+(i.cantidad*(i.precio_venta||0)),0)||0;
                  const ganancia = subtVenta - subtProd;
                  return (
                    <tr key={c.id} className="row-hover">
                      <TD color="#ff6b35">{c.codigo}</TD>
                      <TD><strong>{c.proveedor}</strong></TD>
                      <TD>{c.fecha}</TD>
                      <TD color="#aaa">{c.items?.map(i=>i.nombre).join(", ")}</TD>
                      <TD color="#00d4ff">{c.items?.reduce((s,i)=>s+i.cantidad,0)||0}</TD>
                      <TD color="#ff6b35">{fmt(subtProd)}</TD>
                      <TD color="#ffd600">{c.gastoCourier>0?fmt(c.gastoCourier):"—"}</TD>
                      <TD color="#ff3d57"><strong>{fmt(c.total)}</strong></TD>
                      <TD color={ganancia>0?"#00e676":"#ff3d57"}><strong>{subtVenta>0?fmt(ganancia):"—"}</strong></TD>
                      <TD>
                        <BtnSm color="#ffd600" onClick={()=>{setCompraForm({proveedor:c.proveedor,fecha:c.fecha,items:c.items||[],gastoCourier:String(c.gastoCourier||0),notas:c.notas||""});setCompraItem(emptyCompraItem);setModal({type:"compra",editId:c.id});}}>EDITAR</BtnSm>
                        {" "}
                        <BtnSm color="#ff3d57" onClick={()=>setConfirm({title:"¿ELIMINAR COMPRA?",msg:"Se eliminará la compra y el stock agregado se revertirá del inventario. Productos con stock 0 serán eliminados.",onConfirm:()=>delCompra(c.id)})}>DEL</BtnSm>
                      </TD>
                    </tr>
                  );
                })}
              </Table>
              {/* Resumen totales */}
              {data.compras.length>0 && (() => {
                const totCosto = data.compras.reduce((s,c)=>s+(c.subtotalProductos||c.total||0),0);
                const totCourier = data.compras.reduce((s,c)=>s+(c.gastoCourier||0),0);
                const totVenta = data.compras.reduce((s,c)=>s+(c.items?.reduce((ss,i)=>ss+(i.cantidad*(i.precio_venta||0)),0)||0),0);
                const totGanancia = totVenta - totCosto;
                return (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:16}}>
                    {[
                      {label:"TOTAL INVERTIDO",val:fmt(totCosto+totCourier),color:"#ff3d57"},
                      {label:"COURIER TOTAL",val:fmt(totCourier),color:"#ffd600"},
                      {label:"VALOR EN VENTA",val:totVenta>0?fmt(totVenta):"—",color:"#00d4ff"},
                      {label:"GANANCIA EST.",val:totVenta>0?fmt(totGanancia):"—",color:totGanancia>0?"#00e676":"#ff3d57"},
                    ].map(s=>(
                      <div key={s.label} style={{background:"#080808",border:`1px solid ${s.color}30`,borderRadius:6,padding:"14px 18px",textAlign:"center"}}>
                        <div style={{fontFamily:"Orbitron,monospace",fontSize:16,fontWeight:900,color:s.color}}>{s.val}</div>
                        <div style={{fontSize:9,color:"#333",marginTop:5,letterSpacing:1.5}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── DEUDAS — con columna PENDIENTE y botón ABONO ──────────── */}
          {view==="deudas" && (
            <div className="fade-in">
              <Table headers={["#","CLIENTE","DESCRIPCIÓN","MONTO","PAGADO","PENDIENTE","VENCE","ESTADO","ACCIONES"]}>
                {data.deudas.length===0 && <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:"#333", fontSize:13 }}>SIN DEUDAS REGISTRADAS</td></tr>}
                {[...data.deudas].reverse().map(d => {
                  const pendiente = d.monto - d.monto_pagado;
                  return (
                    <tr key={d.id} className="row-hover">
                      <TD color="#ff3d57">D-{String(d.id).padStart(3,"0")}</TD>
                      <TD><strong>{d.cliente_nombre}</strong></TD>
                      <TD color="#666">{d.descripcion}</TD>
                      <TD color="#ff3d57"><strong>{fmt(d.monto)}</strong></TD>
                      <TD color="#00e676">{fmt(d.monto_pagado)}</TD>
                      <TD color={pendiente>0?"#ffd600":"#00e676"}><strong>{fmt(pendiente)}</strong></TD>
                      <TD>{d.fecha_vencimiento||"—"}</TD>
                      <TD><Tag color={d.estado==="Pagado"?"#00e676":d.estado==="Parcial"?"#ffd600":"#ff3d57"}>{d.estado}</Tag></TD>
                      <TD>
                        {d.estado!=="Pagado" && (
                          <>
                            <BtnSm color="#ffd600" onClick={()=>{setAbonoForm(emptyAbono);setModal({type:"abono",deudaId:d.id});}}>ABONO</BtnSm>
                            {" "}
                            <BtnSm color="#a78bfa" onClick={()=>{setAbonoForm({monto:String(d.monto_pagado),nota:""});setModal({type:"editDeuda",deudaId:d.id});}}>EDITAR</BtnSm>
                            {" "}
                            <BtnSm color="#00e676" onClick={()=>pagarDeuda(d.id)}>PAGADO</BtnSm>
                            {" "}
                          </>
                        )}
                        <BtnSm color="#ff3d57" onClick={()=>setConfirm({title:"¿ELIMINAR DEUDA?",msg:"Esta deuda será eliminada.",onConfirm:()=>delDeuda(d.id)})}>DEL</BtnSm>
                      </TD>
                    </tr>
                  );
                })}
              </Table>
            </div>
          )}

          {/* ── COTIZACIONES ──────────────────────────────────────────── */}
          {view==="cotizaciones" && (
            <div className="fade-in">
              <div style={{ position:"relative", maxWidth:380, marginBottom:16 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#a78bfa", fontSize:12, pointerEvents:"none" }}>📋</span>
                <input
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  placeholder="Buscar por cliente o código..."
                  style={{ width:"100%", padding:"10px 14px 10px 30px", border:"1px solid #a78bfa20", borderRadius:4, fontSize:12, fontFamily:"inherit", background:"#080808", color:"#e0e0e0", outline:"none", letterSpacing:.5 }}
                />
                {search && (
                  <button onClick={()=>setSearch("")}
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#ff3d57", cursor:"pointer", fontSize:14, padding:2 }}>✕</button>
                )}
              </div>
              {(() => {
                const filtradas = [...data.cotizaciones]
                  .reverse()
                  .filter(c =>
                    c.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
                    c.codigo.toLowerCase().includes(search.toLowerCase())
                  );
                return (
                  <Table headers={["CÓDIGO","CLIENTE","FECHA","VALIDEZ","ITEMS","TOTAL","ESTADO","ACCIONES"]}>
                    {filtradas.length === 0 && (
                      <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:"#333", fontSize:13 }}>
                        {search ? `Sin resultados para "${search}"` : "SIN COTIZACIONES REGISTRADAS"}
                      </td></tr>
                    )}
                    {filtradas.map(c => (
                      <tr key={c.id} className="row-hover">
                        <TD color="#a78bfa">{c.codigo}</TD>
                        <TD><strong>{c.cliente_nombre}</strong></TD>
                        <TD>{c.fecha}</TD>
                        <TD>{c.validez||"—"}</TD>
                        <TD color="#666">{c.items?.length} producto{c.items?.length!==1?"s":""}</TD>
                        <TD color="#a78bfa"><strong>{fmt(c.total)}</strong></TD>
                        <TD><Tag color={c.estado==="Vigente"?"#a78bfa":"#ffd600"}>{c.estado}</Tag></TD>
                        <TD>
                          <BtnSm color="#a78bfa" onClick={()=>exportCotizacionPDF(c.id)}>PDF</BtnSm>
                          {" "}
                          <BtnSm color="#ff3d57" onClick={()=>setConfirm({title:"¿ELIMINAR COTIZACIÓN?",msg:"Será eliminada permanentemente.",onConfirm:()=>delCotizacion(c.id)})}>DEL</BtnSm>
                        </TD>
                      </tr>
                    ))}
                  </Table>
                );
              })()}
            </div>
          )}

          {/* ── GANANCIAS ─────────────────────────────────────────────── */}
          {view==="ganancias" && (
            <div className="fade-in">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
                {[
                  {label:"INGRESOS",      value:fmt(totalVentas),  color:"#00e676", icon:"▲"},
                  {label:"GASTOS",        value:fmt(totalCompras), color:"#ff6b35", icon:"▼"},
                  {label:"GANANCIA NETA", value:fmt(margen),       color:margen>=0?"#00d4ff":"#ff3d57", icon:"◎"},
                ].map((s,i) => (
                  <div key={i} style={{ background:"#080808", border:`1px solid ${s.color}30`, borderRadius:6, padding:"28px 24px", textAlign:"center" }}>
                    <div style={{ fontSize:36, color:s.color, marginBottom:12 }}>{s.icon}</div>
                    <div style={{ fontFamily:"Orbitron,monospace", fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"#333", marginTop:8, letterSpacing:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <d
