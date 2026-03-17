import { useState, useEffect, useRef } from "react";
// ═══════════════════════════════════════════════════════════
// NEXUSTORERD v5.3 — Sistema de Gestión | by Jeffrey Vargas
// NOVEDADES v5.3: PDF generado con jsPDF sin popups ni window.open/print
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
const STORAGE_KEY = "nexustorerd-v53";
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
 const [reporteModal, setReporteModal] = useState(false);
 const [reporteRango, setReporteRango] = useState({ desde:"", hasta:"" });
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
 const anoActual = new Date().getFullYear();
 const ventasPorMes = MESES.map((m, i) => {
 const valor = data.ventas
 .filter(v => {
 const f = new Date(v.fecha);
 return f.getFullYear() === anoActual && f.getMonth() === i;
 })
 .reduce((s, v) => s + v.total, 0);
 return { mes: m, valor };
 });
 const comprasPorMes = MESES.map((m, i) => {
 const valor = data.compras
 .filter(c => {
 const f = new Date(c.fecha);
 return f.getFullYear() === anoActual && f.getMonth() === i;
 })
 .reduce((s, c) => s + (c.total || 0), 0);
 return { mes: m, valor };
 });
 const maxVenta = Math.max(...ventasPorMes.map(v => v.valor), ...comprasPorMes.map(c => c.valor), 1);
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
 <button onclick="window.print()" style="background:#6d28d9;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:700;margin-right:10px;"> IMPRIMIR / GUARDAR PDF</button>
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
 <div class="section-title"> Datos de la cotización</div>
 <div class="info-row"><span style="color:#999;">Fecha emisión</span><strong>${c.fecha}</strong></div>
 <div class="info-row"><span style="color:#999;">Válida hasta</span><strong>${c.validez||"—"}</strong></div>
 <div class="info-row"><span style="color:#999;">Código</span><strong>${c.codigo}</strong></div>
 </div>
 <div class="info-box">
 <div class="section-title"> Cliente</div>
 <div class="info-row"><span style="color:#999;">Nombre</span><strong>${c.cliente_nombre}</strong></div>
 <div class="info-row"><span style="color:#999;">Teléfono</span><strong>${c.cliente_telefono||"—"}</strong></div>
 <div class="info-row"><span style="color:#999;">Correo</span><strong>${c.cliente_email||"—"}</strong></div>
 </div>
 </div>
 ${c.notas ? `<div class="notes"> <strong>Notas:</strong> ${c.notas}</div>` : ""}
 <div class="section-title" style="margin-bottom:12px;"> Productos cotizados</div>
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
 // ── Export Reporte PDF ─────────────────────────────────────────────────────
 const exportReportePDF = (data, fmt, ano, ventasPorMes, comprasPorMes, totalVentas, totalCompras, margen, margenPct, totalDeudas) => {
 const w = window.open("", "_blank");
 const mesActual = new Date().toLocaleDateString("es-DO",{month:"long",year:"numeric"}).toUpperCase();
 const maxVal = Math.max(...ventasPorMes.map(v=>v.valor), ...comprasPorMes.map(c=>c.valor), 1);
 const barH = 140;
 const barsHTML = MESES.map((m,i) => {
 const hV = Math.round((ventasPorMes[i].valor/maxVal)*barH);
 const hC = Math.round((comprasPorMes[i].valor/maxVal)*barH);
 const gan = ventasPorMes[i].valor - comprasPorMes[i].valor;
 return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
 <div style="width:100%;display:flex;gap:2px;align-items:flex-end;height:${barH}px;">
 <div style="flex:1;height:${hV}px;background:#2563eb;border-radius:2px 2px 0 0;" title="Ventas"></div>
 <div style="flex:1;height:${hC}px;background:#ea580c;border-radius:2px 2px 0 0;" title="Gastos"></div>
 </div>
 <div style="font-size:8px;color:#888;margin-top:2px;">${m}</div>
 ${ventasPorMes[i].valor>0||comprasPorMes[i].valor>0?`<div style="font-size:7px;color:${gan>=0?'#16a34a':'#dc2626'};font-weight:700;">${gan>=0?'+':''}${Math.round(gan/1000)}K</div>`:''}
 </div>`;
 }).join("");
 const topProds = [...data.productos]
 .filter(p=>p.precio_compra>0)
 .map(p=>({...p,margenPct:(((p.precio_venta-p.precio_compra)/p.precio_compra)*100)}))
 .sort((a,b)=>b.margenPct-a.margenPct)
 .slice(0,8);
 w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
 <title>Reporte Financiero ${ano} — NexuStoreRD</title>
 <style>
 *{box-sizing:border-box;margin:0;padding:0;}
 body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#222;padding:36px;font-size:13px;}
 .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:18px;border-bottom:3px solid #2563eb;}
 .logo{font-size:26px;font-weight:900;color:#2563eb;letter-spacing:2px;}
 .logo span{color:#ea580c;}
 .badge{background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 18px;text-align:right;}
 .badge-title{font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;}
 .badge-val{font-size:18px;font-weight:900;color:#2563eb;margin-top:2px;}
 .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
 .card{background:#f8fafc;border-radius:8px;padding:16px;border-left:4px solid;}
 .card-val{font-size:20px;font-weight:900;margin-bottom:4px;}
 .card-lbl{font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;}
 .section{margin-bottom:28px;}
 .section-title{font-size:11px;font-weight:700;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid #f0f0f0;}
 .chart-wrap{display:flex;align-items:flex-end;gap:4px;height:${barH+20}px;background:#f8fafc;border-radius:8px;padding:16px 12px 8px;}
 table{width:100%;border-collapse:collapse;}
 th{background:#2563eb;color:#fff;padding:9px 12px;text-align:left;font-size:11px;letter-spacing:1px;}
 td{padding:9px 12px;font-size:12px;border-bottom:1px solid #f0f0f0;}
 tr:nth-child(even) td{background:#f8fafc;}
 .bar-legend{display:flex;gap:16px;margin-bottom:10px;}
 .bar-legend span{display:flex;align-items:center;gap:5px;font-size:11px;color:#555;}
 .dot{width:10px;height:10px;border-radius:2px;display:inline-block;}
 .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:11px;color:#aaa;}
 @media print{.no-print{display:none!important;}}
 </style></head><body>
 <div class="no-print" style="text-align:center;margin-bottom:24px;">
 <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:700;margin-right:10px;"> IMPRIMIR / GUARDAR PDF</button>
 <button onclick="window.close()" style="background:#f3f4f6;color:#555;border:1px solid #ddd;padding:10px 20px;border-radius:6px;font-size:14px;cursor:pointer;">CERRAR</button>
 </div>
 <div class="header">
 <div>
 <div class="logo">NEXU<span>STORE</span> <span style="color:#ea580c;">RD</span></div>
 <div style="font-size:11px;color:#888;margin-top:4px;letter-spacing:2px;">REPORTE FINANCIERO ANUAL</div>
 <div style="font-size:12px;color:#aaa;margin-top:6px;">Generado el ${new Date().toLocaleDateString("es-DO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
 </div>
 <div class="badge">
 <div class="badge-title">Período</div>
 <div class="badge-val">${ano}</div>
 </div>
 </div>
 <div class="cards">
 ${[
 {label:"Ingresos Totales", val:fmt(totalVentas), color:"#16a34a", bg:"#f0fdf4"},
 {label:"Gastos Totales", val:fmt(totalCompras), color:"#ea580c", bg:"#fff7ed"},
 {label:"Ganancia Neta", val:fmt(margen), color: margen>=0?"#2563eb":"#dc2626", bg:"#eff6ff"},
 {label:"Rentabilidad", val:`${margenPct}%`, color: margenPct>0?"#16a34a":"#dc2626", bg:"#f0fdf4"},
 ].map(s=>`<div class="card" style="border-left-color:${s.color};background:${s.bg};">
 <div class="card-val" style="color:${s.color};">${s.val}</div>
 <div class="card-lbl">${s.label}</div>
 </div>`).join("")}
 </div>
 <div class="section">
 <div class="section-title"> Ventas vs Gastos por mes — ${ano}</div>
 <div class="bar-legend">
 <span><span class="dot" style="background:#2563eb;"></span>Ventas</span>
 <span><span class="dot" style="background:#ea580c;"></span>Gastos</span>
 <span style="margin-left:auto;font-size:10px;color:#aaa;">Número sobre cada mes = ganancia del mes (K = miles DOP)</span>
 </div>
 <div class="chart-wrap">${barsHTML}</div>
 </div>
 <div class="section">
 <div class="section-title"> Margen de ganancia por producto</div>
 <table>
 <thead><tr><th>#</th><th>PRODUCTO</th><th>CATEGORÍA</th><th>COSTO</th><th>P. VENTA</th><th>MARGEN %</th><th>GANANCIA/UND</th><th>STOCK</th></tr></thead>
 <tbody>
 ${topProds.map((p,i)=>`<tr>
 <td>${i+1}</td>
 <td><strong>${p.nombre}</strong></td>
 <td>${p.categoria}</td>
 <td>${fmt(p.precio_compra)}</td>
 <td>${fmt(p.precio_venta)}</td>
 <td style="font-weight:900;color:${p.margenPct>=60?'#16a34a':p.margenPct>=30?'#d97706':'#dc2626'};">${p.margenPct.toFixed(1)}%</td>
 <td style="color:#16a34a;font-weight:700;">${fmt(p.precio_venta-p.precio_compra)}</td>
 <td style="color:${p.stock<=p.stock_minimo?'#dc2626':'#222'};">${p.stock}</td>
 </tr>`).join("")}
 </tbody>
 </table>
 </div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;" class="section">
 <div>
 <div class="section-title"> Resumen financiero</div>
 <table>
 ${[
 {label:"Total ventas registradas", val:data.ventas.length+" transacciones"},
 {label:"Total compras registradas", val:data.compras.length+" órdenes"},
 {label:"Ventas pendientes de cobro", val:fmt(data.ventas.filter(v=>v.estado==="Pendiente").reduce((s,v)=>s+v.total,0))},
 {label:"Deudas por cobrar", val:fmt(totalDeudas)},
 {label:"Productos en inventario", val:data.productos.length+" productos"},
 {label:"Clientes registrados", val:data.clientes.length+" clientes"},
 {label:"Cotizaciones activas", val:data.cotizaciones?.filter(c=>c.estado==="Vigente").length||0},
 ].map(r=>`<tr><td style="color:#888;">${r.label}</td><td style="font-weight:700;text-align:right;">${r.val}</td></tr>`).join("")}
 </table>
 </div>
 <div>
 <div class="section-title">⚠ Alertas de inventario</div>
 ${data.productos.filter(p=>p.stock<=p.stock_minimo).length===0
 ? '<div style="padding:16px;background:#f0fdf4;border-radius:6px;color:#16a34a;font-size:13px;">✓ Todo el inventario está en orden</div>'
 : `<table><thead><tr><th>PRODUCTO</th><th>STOCK</th><th>MÍNIMO</th></tr></thead><tbody>
 ${data.productos.filter(p=>p.stock<=p.stock_minimo).map(p=>`<tr>
 <td>${p.nombre}</td>
 <td style="color:#dc2626;font-weight:900;">${p.stock}</td>
 <td style="color:#888;">${p.stock_minimo}</td>
 </tr>`).join("")}
 </tbody></table>`
 }
 </div>
 </div>
 <div class="footer">
 <span><strong>NexuStoreRD</strong> — Accesorios de PC | Santo Domingo, República Dominicana</span>
 <span>Reporte generado automáticamente · Período ${ano}</span>
 </div>
 </body></html>`);
 w.document.close();
 };
 // ── Nav ────────────────────────────────────────────────────────────────────
 const NAV = [
 { id:"dashboard", icon:"◈", label:"Dashboard" },
 { id:"inventario", icon:"▦", label:"Inventario" },
 { id:"clientes", icon:"◉", label:"Clientes" },
 { id:"ventas", icon:"▲", label:"Ventas" },
 { id:"compras", icon:"▼", label:"Compras" },
 { id:"deudas", icon:"◆", label:"Deudas" },
 { id:"cotizaciones", icon:" ", label:"Cotizaciones" },
 { id:"ganancias", icon:"◎", label:"Ganancias" },
 ];
 const filteredProds = data.productos.filter(p => {
 const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
 const matchCat = catFilter === "Todas" || p.categoria.toLowerCase().includes(catFilter.toLowerCase());
 return matchSearch && matchCat;
 });
 const filteredClients = data.clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()) || (c.cedula||"").includes(search));
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
 <div style={{ fontSize:10, color:"#333", marginTop:6, letterSpacing:1 }}>SISTEMA DE GESTIÓN v5.3</div>
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
 {view==="inventario" && <Btn color="#00d4ff" onClick={()=>{setProdForm(emptyProd);setModal({type:"prod"});}}>＋ PRODUCTO</Btn>}
 {view==="clientes" && <Btn color="#00d4ff" onClick={()=>{setClientForm(emptyClient);setModal({type:"client"});}}>＋ CLIENTE</Btn>}
 {view==="ventas" && <Btn color="#00e676" onClick={()=>{setVentaForm(emptyVenta);setVentaClientSearch("");setVentaProdSearch("");setModal({type:"venta"});}}>＋ VENTA</Btn>}
 {view==="compras" && <Btn color="#ff6b35" onClick={()=>{setCompraForm(emptyCompra);setModal({type:"compra"});}}>＋ COMPRA</Btn>}
 {view==="deudas" && <Btn color="#ff3d57" onClick={()=>{setDeudaForm(emptyDeuda);setDeudaItem(emptyDeudaItem);setModal({type:"deuda"});}}>＋ DEUDA</Btn>}
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
 { label:"VENTAS TOTALES", value:fmt(totalVentas), icon:"▲", color:"#00e676", sub:`${data.ventas.length} transacciones` },
 { label:"COMPRAS TOTALES", value:fmt(totalCompras), icon:"▼", color:"#ff6b35", sub:`${data.compras.length} órdenes` },
 { label:"MARGEN BRUTO", value:fmt(margen), icon:"◎", color:"#00d4ff", sub:`${margenPct}% rentabilidad` },
 { label:"DEUDAS ACTIVAS", value:fmt(totalDeudas), icon:"◆", color:"#ff3d57", sub:`${data.deudas.filter(d=>d.estado!=="Pagado").length} clientes` },
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
 {/* Header del gráfico con botón PDF */}
 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
 <div>
 <div style={{ fontFamily:"Orbitron,monospace", fontSize:11, color:"#00d4ff", letterSpacing:2 }}>◈ VENTAS Y GASTOS — {anoActual}</div>
 <div style={{ display:"flex", gap:12, marginTop:6 }}>
 <span style={{ fontSize:9, color:"#00d4ff", display:"flex", alignItems:"center", gap:4 }}>
 <span style={{ width:8, height:8, background:"#00d4ff", borderRadius:1, display:"inline-block" }} /> VENTAS
 </span>
 <span style={{ fontSize:9, color:"#ff6b35", display:"flex", alignItems:"center", gap:4 }}>
 <span style={{ width:8, height:8, background:"#ff6b35", borderRadius:1, display:"inline-block" }} /> GASTOS
 </span>
 </div>
 </div>
 <button className="btn-glow" onClick={()=>setReporteModal(true)}
 style={{ background:"#a78bfa20", color:"#a78bfa", border:"1px solid #a78bfa60", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:10, fontWeight:700, letterSpacing:1, padding:"7px 12px" }}>
 GENERAR REPORTE
 </button>
 </div>
 {/* Gráfico de barras doble */}
 <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:120 }}>
 {ventasPorMes.map((v,i) => {
 const hV = maxVenta > 0 ? (v.valor/maxVenta)*100 : 0;
 const hC = maxVenta > 0 ? (comprasPorMes[i].valor/maxVenta)*100 : 0;
 return (
 <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
 <div style={{ width:"100%", display:"flex", gap:1, alignItems:"flex-end", height:100 }}>
 <div style={{ flex:1, height:`${hV}%`, minHeight: v.valor>0?2:0, background:"#00d4ff", borderRadius:"2px 2px 0 0", opacity:.9 }} title={`Ventas: ${fmt(v.valor)}`} />
 <div style={{ flex:1, height:`${hC}%`, minHeight: comprasPorMes[i].valor>0?2:0, background:"#ff6b35", borderRadius:"2px 2px 0 0", opacity:.8 }} title={`Gastos: ${fmt(comprasPorMes[i].valor)}`} />
 </div>
 <div style={{ fontSize:7, color:"#333", letterSpacing:.3 }}>{v.mes}</div>
 </div>
 );
 })}
 </div>
 {/* Totales rápidos del año */}
 <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, paddingTop:10, borderTop:"1px solid #ffffff08" }}>
 <div style={{ fontSize:10 }}><span style={{ color:"#444" }}>Ventas {anoActual}: </span><strong style={{ color:"#00d4ff" }}>{fmt(totalVentas)}</strong></div>
 <div style={{ fontSize:10 }}><span style={{ color:"#444" }}>Gastos: </span><strong style={{ color:"#ff6b35" }}>{fmt(totalCompras)}</strong></div>
 <div style={{ fontSize:10 }}><span style={{ color:"#444" }}>Margen: </span><strong style={{ color: margen>=0?"#00e676":"#ff3d57" }}>{fmt(margen)}</strong></div>
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
 <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#a78bfa", fontSize:12, pointerEvents:"none" }}> </span>
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
 {label:"INGRESOS", value:fmt(totalVentas), color:"#00e676", icon:"▲"},
 {label:"GASTOS", value:fmt(totalCompras), color:"#ff6b35", icon:"▼"},
 {label:"GANANCIA NETA", value:fmt(margen), color:margen>=0?"#00d4ff":"#ff3d57", icon:"◎"},
 ].map((s,i) => (
 <div key={i} style={{ background:"#080808", border:`1px solid ${s.color}30`, borderRadius:6, padding:"28px 24px", textAlign:"center" }}>
 <div style={{ fontSize:36, color:s.color, marginBottom:12 }}>{s.icon}</div>
 <div style={{ fontFamily:"Orbitron,monospace", fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
 <div style={{ fontSize:11, color:"#333", marginTop:8, letterSpacing:2 }}>{s.label}</div>
 </div>
 ))}
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
 <div style={{ background:"#080808", border:"1px solid #00d4ff20", borderRadius:6, padding:"24px" }}>
 <div style={{ fontFamily:"Orbitron,monospace", fontSize:11, color:"#00d4ff", letterSpacing:2, marginBottom:20 }}>◈ MARGEN POR PRODUCTO</div>
 {data.productos.map(p => {
 const m = p.precio_compra>0 ? Math.min(100,(((p.precio_venta-p.precio_compra)/p.precio_compra)*100)) : 0;
 const color = m>=60?"#00e676":m>=40?"#ffd600":"#ff3d57";
 return (
 <div key={p.id} style={{ marginBottom:14 }}>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
 <span style={{ fontSize:12, color:"#aaa" }}>{p.nombre}</span>
 <span style={{ fontWeight:900, color, fontSize:12 }}>{m.toFixed(0)}%</span>
 </div>
 <div style={{ background:"#111", borderRadius:2, height:5 }}>
 <div style={{ width:`${m}%`, height:5, borderRadius:2, background:color, transition:"width .6s" }} />
 </div>
 </div>
 );
 })}
 </div>
 <div style={{ background:"#080808", border:"1px solid #00d4ff20", borderRadius:6, padding:"24px" }}>
 <div style={{ fontFamily:"Orbitron,monospace", fontSize:11, color:"#00d4ff", letterSpacing:2, marginBottom:20 }}>◎ RESUMEN FINANCIERO</div>
 {[
 {label:"Total Ingresos", value:fmt(totalVentas), color:"#00e676"},
 {label:"Total Gastos", value:fmt(totalCompras), color:"#ff6b35"},
 {label:"Ganancia Bruta", value:fmt(margen), color:"#00d4ff"},
 {label:"Rentabilidad", value:`${margenPct}%`, color:margenPct>0?"#00e676":"#ff3d57"},
 {label:"Ventas Pendientes", value:fmt(data.ventas.filter(v=>v.estado==="Pendiente").reduce((s,v)=>s+v.total,0)), color:"#ffd600"},
 {label:"Deudas por Cobrar", value:fmt(totalDeudas), color:"#ff3d57"},
 {label:"Cotizaciones Activas", value:data.cotizaciones.filter(c=>c.estado==="Vigente").length, color:"#a78bfa"},
 {label:"Productos Activos", value:data.productos.length, color:"#00d4ff"},
 {label:"Clientes Registrados", value:data.clientes.length, color:"#00d4ff"},
 ].map(item => (
 <div key={item.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #ffffff05" }}>
 <span style={{ color:"#444", fontSize:12, letterSpacing:.5 }}>{item.label}</span>
 <span style={{ fontWeight:900, color:item.color, fontSize:14 }}>{item.value}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 {/* ═══ MODALES ════════════════════════════════════════════════════════ */}
 {/* Producto */}
 {modal?.type==="prod" && (
 <Modal title={modal.editId?"✏ EDITAR PRODUCTO":"＋ NUEVO PRODUCTO"} color="#00d4ff" onClose={()=>setModal(null)} onSave={saveProd} saveLabel="GUARDAR">
 <Grid2>
 <Field label="NOMBRE *"><Input value={prodForm.nombre} onChange={e=>setProdForm({...prodForm,nombre:e.target.value})} placeholder="Ej: Mouse Gamer RGB" /></Field>
 {/* Categoría con opción de crear nueva */}
 <Field label="CATEGORÍA">
 <div style={{ display:"flex", gap:6 }}>
 <select value={prodForm.categoria} onChange={e=>setProdForm({...prodForm,categoria:e.target.value})}
 style={{ flex:1, padding:"10px 14px", border:"1px solid #1a1a1a", borderRadius:4, fontSize:12, background:"#0a0a0a", color:"#e0e0e0", outline:"none", cursor:"pointer", fontFamily:"inherit" }}>
 {(data.categorias||[]).map(c=><option key={c}>{c}</option>)}
 </select>
 </div>
 {/* Agregar nueva categoría */}
 <div style={{ display:"flex", gap:6, marginTop:6 }}>
 <input value={nuevaCat} onChange={e=>setNuevaCat(e.target.value)}
 onKeyDown={e=>e.key==="Enter"&&addCategoria()}
 placeholder="Nueva categoría..." maxLength={30}
 style={{ flex:1, padding:"7px 12px", border:"1px solid #1a1a1a", borderRadius:4, fontSize:11, background:"#0a0a0a", color:"#e0e0e0", outline:"none", fontFamily:"inherit" }} />
 <button onClick={addCategoria} className="btn-glow"
 style={{ background:"#00d4ff15", color:"#00d4ff", border:"1px solid #00d4ff40", borderRadius:4, cursor:"pointer", fontSize:11, padding:"7px 12px", fontFamily:"inherit", fontWeight:700, whiteSpace:"nowrap" }}>
 ＋ AGREGAR
 </button>
 </div>
 {/* Chips de categorías */}
 <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:6 }}>
 {(data.categorias||[]).map(c=>(
 <span key={c} style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:3, fontSize:10, background: prodForm.categoria===c?"#00d4ff20":"#1a1a1a", color: prodForm.categoria===c?"#00d4ff":"#444", border:`1px solid ${prodForm.categoria===c?"#00d4ff40":"#222"}`, cursor:"pointer" }}
 onClick={()=>setProdForm({...prodForm,categoria:c})}>
 {c}
 </span>
 ))}
 </div>
 </Field>
 <Field label="STOCK"><Input type="number" value={prodForm.stock} onChange={e=>setProdForm({...prodForm,stock:e.target.value})} /></Field>
 <Field label="STOCK MÍNIMO"><Input type="number" value={prodForm.stock_minimo} onChange={e=>setProdForm({...prodForm,stock_minimo:e.target.value})} /></Field>
 <Field label="PRECIO COMPRA (DOP)"><Input type="number" value={prodForm.precio_compra} onChange={e=>setProdForm({...prodForm,precio_compra:e.target.value})} /></Field>
 <Field label="PRECIO VENTA (DOP) *"><Input type="number" value={prodForm.precio_venta} onChange={e=>setProdForm({...prodForm,precio_venta:e.target.value})} /></Field>
 </Grid2>
 {/* Imagen del producto */}
 <Field label="IMAGEN DEL PRODUCTO (opcional — máx 2MB)">
 <div style={{ display:"flex", gap:12, alignItems:"center" }}>
 <div style={{ flex:1 }}>
 <input ref={imgInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageUpload} />
 <button className="btn-glow" onClick={()=>imgInputRef.current.click()}
 style={{ background:"#00d4ff10", color:"#00d4ff", border:"1px solid #00d4ff40", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700, letterSpacing:1, padding:"10px 18px", width:"100%" }}>
 SELECCIONAR IMAGEN DESDE PC
 </button>
 </div>
 {prodForm.imagen && (
 <div style={{ position:"relative" }}>
 <img src={prodForm.imagen} alt="preview" style={{ width:70, height:70, objectFit:"cover", borderRadius:4, border:"1px solid #00d4ff40" }} />
 <button onClick={()=>setProdForm({...prodForm,imagen:""})}
 style={{ position:"absolute", top:-6, right:-6, background:"#ff3d57", color:"#fff", border:"none", borderRadius:"50%", width:18, height:18, cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>✕</button>
 </div>
 )}
 {!prodForm.imagen && (
 <div style={{ width:70, height:70, border:"1px dashed #333", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}> </div>
 )}
 </div>
 </Field>
 {prodForm.precio_compra && prodForm.precio_venta && (
 <div style={{ background:"#00d4ff10", border:"1px solid #00d4ff30", borderRadius:4, padding:"10px 16px", fontSize:12, color:"#00d4ff" }}>
 ◈ MARGEN: <strong>{(((prodForm.precio_venta-prodForm.precio_compra)/prodForm.precio_compra)*100).toFixed(1)}%</strong> — GANANCIA/UND: <strong style={{color:"#00e676"}}>{fmt(prodForm.precio_venta-prodForm.precio_compra)}</strong>
 </div>
 )}
 </Modal>
 )}
 {/* Ver imagen producto */}
 {modal?.type==="verImg" && modal.prod && (
 <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.95)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}
 onClick={()=>setModal(null)}>
 <div className="fade-in" style={{ background:"#080808", border:"1px solid #00d4ff30", borderRadius:12, maxWidth:500, width:"100%", overflow:"hidden", boxShadow:"0 0 60px #00d4ff20" }} onClick={e=>e.stopPropagation()}>
 <div style={{ padding:"16px 22px", borderBottom:"1px solid #00d4ff20", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
 <div>
 <div style={{ fontFamily:"Orbitron,monospace", fontSize:13, fontWeight:900, color:"#00d4ff", letterSpacing:2 }}>{modal.prod.nombre}</div>
 <div style={{ fontSize:10, color:"#444", marginTop:3 }}>{modal.prod.codigo} · <Tag color="#00d4ff">{modal.prod.categoria}</Tag></div>
 </div>
 <button onClick={()=>setModal(null)} className="btn-glow" style={{ background:"transparent", color:"#ff3d57", border:"1px solid #ff3d5740", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, padding:"6px 12px" }}>✕ CERRAR</button>
 </div>
 <div style={{ padding:24, textAlign:"center" }}>
 <img src={modal.prod.imagen} alt={modal.prod.nombre} style={{ maxWidth:"100%", maxHeight:340, objectFit:"contain", borderRadius:6, border:"1px solid #00d4ff20" }} />
 </div>
 <div style={{ padding:"14px 22px", borderTop:"1px solid #00d4ff15", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, textAlign:"center" }}>
 {[
 {label:"P. VENTA", val:fmt(modal.prod.precio_venta), color:"#00e676"},
 {label:"STOCK", val:modal.prod.stock, color:modal.prod.stock<=modal.prod.stock_minimo?"#ff3d57":"#00e676"},
 {label:"MARGEN", val:modal.prod.precio_compra>0?`${(((modal.prod.precio_venta-modal.prod.precio_compra)/modal.prod.precio_compra)*100).toFixed(0)}%`:"N/A", color:"#ffd600"},
 ].map(s=>(
 <div key={s.label} style={{ background:"#0a0a0a", borderRadius:4, padding:"10px 8px" }}>
 <div style={{ fontSize:16, fontWeight:900, color:s.color }}>{s.val}</div>
 <div style={{ fontSize:9, color:"#333", marginTop:3, letterSpacing:1.5 }}>{s.label}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 {/* Ver productos de venta con imágenes */}
 {modal?.type==="verVenta" && modal.venta && (
 <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.95)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}
 onClick={()=>setModal(null)}>
 <div className="fade-in" style={{ background:"#080808", border:"1px solid #00e67630", borderRadius:12, maxWidth:600, width:"100%", maxHeight:"88vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 0 60px #00e67615" }} onClick={e=>e.stopPropagation()}>
 {/* Header */}
 <div style={{ padding:"16px 22px", borderBottom:"1px solid #00e67620", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
 <div>
 <div style={{ fontFamily:"Orbitron,monospace", fontSize:13, fontWeight:900, color:"#00e676", letterSpacing:2 }}>
 {modal.venta.codigo} — {modal.venta.cliente_nombre}
 </div>
 <div style={{ fontSize:10, color:"#444", marginTop:3 }}>
 {modal.venta.fecha} · <Tag color={modal.venta.estado==="Pagado"?"#00e676":"#ff3d57"}>{modal.venta.estado}</Tag>
 {" · "}<span style={{color:"#00e676",fontWeight:700}}>{fmt(modal.venta.total)}</span>
 </div>
 </div>
 <button onClick={()=>setModal(null)} className="btn-glow" style={{ background:"transparent", color:"#ff3d57", border:"1px solid #ff3d5740", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, padding:"6px 12px" }}>✕ CERRAR</button>
 </div>
 {/* Productos */}
 <div style={{ overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:14 }}>
 {modal.venta.items?.map((item, i) => {
 const prod = data.productos.find(p => p.id===item.producto_id);
 return (
 <div key={i} style={{ background:"#0a0a0a", border:"1px solid #00e67615", borderRadius:8, padding:14, display:"flex", gap:14, alignItems:"center" }}>
 {/* Imagen o placeholder */}
 <div style={{ width:80, height:80, flexShrink:0, borderRadius:6, overflow:"hidden", border:"1px solid #00e67630", background:"#111", display:"flex", alignItems:"center", justifyContent:"center" }}>
 {prod?.imagen
 ? <img src={prod.imagen} alt={item.nombre} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
 : <span style={{ fontSize:28 }}> </span>
 }
 </div>
 {/* Info */}
 <div style={{ flex:1 }}>
 <div style={{ fontWeight:700, color:"#e0e0e0", fontSize:13, marginBottom:4 }}>{item.nombre}</div>
 <div style={{ fontSize:11, color:"#444", marginBottom:6 }}>
 {prod?.categoria && <Tag color="#00d4ff">{prod.categoria}</Tag>}
 {prod?.codigo && <span style={{marginLeft:6,color:"#333"}}>{prod.codigo}</span>}
 </div>
 <div style={{ display:"flex", gap:16, fontSize:12 }}>
 <span style={{color:"#555"}}>Cant: <strong style={{color:"#aaa"}}>{item.cantidad}</strong></span>
 <span style={{color:"#555"}}>P. unit: <strong style={{color:"#00e676"}}>{fmt(item.precio)}</strong></span>
 <span style={{color:"#555"}}>Subtotal: <strong style={{color:"#00e676"}}>{fmt(item.cantidad*item.precio)}</strong></span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 {/* Footer total */}
 <div style={{ padding:"14px 22px", borderTop:"1px solid #00e67615", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
 <span style={{ fontSize:11, color:"#333", letterSpacing:1 }}>{modal.venta.items?.length} PRODUCTO{modal.venta.items?.length!==1?"S":""} EN ESTA VENTA</span>
 <div style={{ textAlign:"right" }}>
 {modal.venta.descuento>0 && <div style={{ fontSize:11, color:"#ff6b35", marginBottom:2 }}>Descuento: − {fmt(modal.venta.descuento)}</div>}
 <div style={{ fontFamily:"Orbitron,monospace", fontSize:16, fontWeight:900, color:"#00e676" }}>{fmt(modal.venta.total)}</div>
 </div>
 </div>
 </div>
 </div>
 )}
 {/* Cliente */}
 {modal?.type==="client" && (
 <Modal title={modal.editId?"✏ EDITAR CLIENTE":"＋ NUEVO CLIENTE"} color="#00d4ff" onClose={()=>setModal(null)} onSave={saveClient} saveLabel="GUARDAR">
 <Grid2>
 <Field label="NOMBRE *"><Input value={clientForm.nombre} onChange={e=>setClientForm({...clientForm,nombre:e.target.value})} /></Field>
 <Field label="CÉDULA"><Input value={clientForm.cedula} onChange={e=>setClientForm({...clientForm,cedula:e.target.value})} placeholder="000-0000000-0" /></Field>
 <Field label="TELÉFONO *"><Input value={clientForm.telefono} onChange={e=>setClientForm({...clientForm,telefono:e.target.value})} /></Field>
 <Field label="CORREO"><Input value={clientForm.email} onChange={e=>setClientForm({...clientForm,email:e.target.value})} /></Field>
 <Field label="CIUDAD"><Input value={clientForm.ciudad} onChange={e=>setClientForm({...clientForm,ciudad:e.target.value})} /></Field>
 </Grid2>
 </Modal>
 )}
 {/* Venta */}
 {modal?.type==="venta" && (() => {
 const clientesFiltV = data.clientes.filter(c =>
 c.nombre.toLowerCase().includes(ventaClientSearch.toLowerCase()) ||
 (c.cedula||"").includes(ventaClientSearch) ||
 (c.telefono||"").includes(ventaClientSearch)
 );
 const clienteSelV = data.clientes.find(c => c.id === +ventaForm.cliente_id);
 const prodsFiltV = data.productos.filter(p =>
 p.nombre.toLowerCase().includes(ventaProdSearch.toLowerCase()) ||
 p.codigo.toLowerCase().includes(ventaProdSearch.toLowerCase())
 );
 const prodSelV = data.productos.find(p => p.id === +ventaItem.producto_id);
 return (
 <Modal title="＋ NUEVA VENTA" color="#00e676" onClose={()=>setModal(null)} onSave={saveVenta} saveLabel="REGISTRAR VENTA">
 {/* Cliente con buscador controlado */}
 <Field label="CLIENTE *">
 <div style={{ position:"relative" }}>
 <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#00e676", fontSize:11, pointerEvents:"none", zIndex:1 }}> </span>
 <input
 value={ventaClientSearch}
 onChange={e=>{ setVentaClientSearch(e.target.value); setVentaForm(f=>({...f,cliente_id:""})); }}
 placeholder="Escribe para buscar cliente..."
 autoComplete="off"
 style={{ width:"100%", padding:"10px 34px 10px 28px", border:`1px solid ${ventaForm.cliente_id?"#00e67660":"#00e67620"}`, borderRadius: ventaClientSearch && !ventaForm.cliente_id && clientesFiltV.length>0?"4px 4px 0 0":"4px", fontSize:12, fontFamily:"inherit", background:"#0a0a0a", color:ventaForm.cliente_id?"#00e676":"#e0e0e0", outline:"none", letterSpacing:.5 }}
 />
 {ventaClientSearch && (
 <button onClick={()=>{ setVentaClientSearch(""); setVentaForm(f=>({...f,cliente_id:""})); }}
 style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#ff3d57", cursor:"pointer", fontSize:13, padding:2, zIndex:1 }}>✕</button>
 )}
 {ventaClientSearch && !ventaForm.cliente_id && clientesFiltV.length>0 && (
 <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#0d0d0d", border:"1px solid #00e67640", borderTop:"none", borderRadius:"0 0 4px 4px", zIndex:50, maxHeight:180, overflowY:"auto" }}>
 {clientesFiltV.slice(0,6).map(c=>(
 <div key={c.id}
 onClick={()=>{ setVentaForm(f=>({...f,cliente_id:String(c.id)})); setVentaClientSearch(c.nombre); }}
 style={{ padding:"9px 14px", cursor:"pointer", fontSize:12, borderBottom:"1px solid #ffffff06", display:"flex", justifyContent:"space-between" }}
 onMouseEnter={e=>e.currentTarget.style.background="#00e67615"}
 onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
 <span style={{color:"#e0e0e0",fontWeight:600}}>{c.nombre}</span>
 <span style={{color:"#444",fontSize:11}}>{c.cedula||c.telefono||""}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 {clienteSelV && (
 <div style={{ background:"#00e67610", border:"1px solid #00e67630", borderRadius:4, padding:"7px 12px", fontSize:11, color:"#00e676", marginTop:5, display:"flex", justifyContent:"space-between" }}>
 <span>✓ <strong>{clienteSelV.nombre}</strong></span>
 <span style={{color:"#555"}}>{clienteSelV.telefono||""}{clienteSelV.ciudad?` · ${clienteSelV.ciudad}`:""}</span>
 </div>
 )}
 {ventaClientSearch && !ventaForm.cliente_id && clientesFiltV.length===0 && (
 <div style={{ fontSize:11, color:"#555", marginTop:5 }}>Sin resultados para "{ventaClientSearch}"</div>
 )}
 </Field>
 <Grid2>
 <Field label="FECHA"><Input type="date" value={ventaForm.fecha} onChange={e=>setVentaForm({...ventaForm,fecha:e.target.value})} /></Field>
 <Field label="ESTADO">
 <Select value={ventaForm.estado} onChange={e=>setVentaForm({...ventaForm,estado:e.target.value,abonoInicial:"0"})}>
 <option>Pagado</option><option>Pendiente</option>
 </Select>
 </Field>
 </Grid2>
 <DescuentoField
 subtotal={ventaForm.items.reduce((s,i)=>s+i.cantidad*i.precio,0)}
 modo={ventaForm.descuentoModo}
 monto={ventaForm.descuento}
 pct={ventaForm.descuentoPct}
 color="#00e676"
 fmt={fmt}
 onModoChange={v=>setVentaForm(f=>({...f,descuentoModo:v,descuento:"0",descuentoPct:"0"}))}
 onMontoChange={v=>setVentaForm(f=>({...f,descuento:v}))}
 onPctChange={v=>setVentaForm(f=>({...f,descuentoPct:v}))}
 />
 {/* Bloque de abono — solo si estado es Pendiente */}
 {ventaForm.estado === "Pendiente" && (() => {
 const sub = ventaForm.items.reduce((s,i)=>s+i.cantidad*i.precio,0);
 const desc = ventaForm.descuentoModo==="%"
 ? Math.round(sub*Math.min(100,Math.max(0,+ventaForm.descuentoPct||0))/100)
 : Math.min(+ventaForm.descuento||0,sub);
 const totalPrev = sub - desc;
 const abono = Math.min(+ventaForm.abonoInicial||0, totalPrev);
 const pendiente = Math.max(0, totalPrev - abono);
 return (
 <div style={{ background:"#ff3d5710", border:"1px solid #ff3d5730", borderRadius:6, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
 <div style={{ fontSize:11, color:"#ff3d57", letterSpacing:2, fontFamily:"Orbitron,monospace" }}>PAGO INICIAL DEL CLIENTE</div>
 <Field label="MONTO ABONADO POR EL CLIENTE (DOP)">
 <Input
 type="number" min="0"
 value={ventaForm.abonoInicial}
 onChange={e=>setVentaForm({...ventaForm,abonoInicial:e.target.value})}
 placeholder="0 si no abona nada"
 />
 </Field>
 {totalPrev > 0 && (
 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
 {[
 {label:"TOTAL VENTA", val:fmt(totalPrev), color:"#aaa"},
 {label:"ABONADO", val:fmt(abono), color:"#00e676"},
 {label:"PENDIENTE", val:fmt(pendiente), color: pendiente===0?"#00e676":"#ff3d57"},
 ].map(s=>(
 <div key={s.label} style={{ background:"#0a0a0a", borderRadius:4, padding:"8px 10px", textAlign:"center" }}>
 <div style={{ fontSize:13, fontWeight:900, color:s.color }}>{s.val}</div>
 <div style={{ fontSize:9, color:"#333", marginTop:3, letterSpacing:1.5 }}>{s.label}</div>
 </div>
 ))}
 </div>
 )}
 <div style={{ fontSize:10, color:"#ffd600", letterSpacing:.5 }}>
 ⚠ El monto pendiente se registrará automáticamente en el apartado de <strong>Deudas</strong>.
 </div>
 </div>
 );
 })()}
 {/* Productos con buscador controlado */}
 <div style={{ background:"#0a0a0a", border:"1px solid #00e67620", borderRadius:6, padding:16 }}>
 <div style={{ fontSize:11, color:"#00e676", letterSpacing:2, marginBottom:10, fontFamily:"Orbitron,monospace" }}>AGREGAR PRODUCTOS</div>
 {/* Buscador */}
 <div style={{ position:"relative", marginBottom:8 }}>
 <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#00e676", fontSize:11, pointerEvents:"none" }}> </span>
 <input
 value={ventaProdSearch}
 onChange={e=>{ setVentaProdSearch(e.target.value); setVentaItem(f=>({...f,producto_id:""})); }}
 placeholder="Buscar producto por nombre o código..."
 autoComplete="off"
 style={{ width:"100%", padding:"8px 32px 8px 28px", border:"1px solid #00e67620", borderRadius: ventaProdSearch && !ventaItem.producto_id && prodsFiltV.length>0?"4px 4px 0 0":"4px", fontSize:12, fontFamily:"inherit", background:"#111", color:"#e0e0e0", outline:"none", letterSpacing:.5 }}
 />
 {ventaProdSearch && (
 <button onClick={()=>{ setVentaProdSearch(""); setVentaItem(f=>({...f,producto_id:""})); }}
 style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#ff3d57", cursor:"pointer", fontSize:13, padding:2 }}>✕</button>
 )}
 {ventaProdSearch && !ventaItem.producto_id && prodsFiltV.length>0 && (
 <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#0d0d0d", border:"1px solid #00e67640", borderTop:"none", borderRadius:"0 0 4px 4px", zIndex:50, maxHeight:180, overflowY:"auto" }}>
 {prodsFiltV.slice(0,6).map(p=>(
 <div key={p.id}
 onClick={()=>{ setVentaItem(f=>({...f,producto_id:String(p.id)})); setVentaProdSearch(p.nombre); }}
 style={{ padding:"9px 14px", cursor:"pointer", fontSize:12, borderBottom:"1px solid #ffffff06", display:"flex", justifyContent:"space-between" }}
 onMouseEnter={e=>e.currentTarget.style.background="#00e67615"}
 onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
 <span style={{color:"#e0e0e0",fontWeight:600}}>{p.nombre}</span>
 <div style={{display:"flex",gap:10,fontSize:11}}>
 <span style={{color:"#00e676"}}>{fmt(p.precio_venta)}</span>
 <span style={{color:p.stock<=p.stock_minimo?"#ff3d57":"#444"}}>stock: {p.stock}</span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 {/* Preview producto seleccionado + cantidad + agregar */}
 {prodSelV && (
 <div style={{ background:"#00e67610", border:"1px solid #00e67630", borderRadius:4, padding:"8px 12px", fontSize:11, color:"#00e676", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
 <span>✓ <strong>{prodSelV.nombre}</strong> — {fmt(prodSelV.precio_venta)}</span>
 <span style={{color:prodSelV.stock<=prodSelV.stock_minimo?"#ff3d57":"#555"}}>stock: {prodSelV.stock}</span>
 </div>
 )}
 <div style={{ display:"flex", gap:8, marginBottom:12 }}>
 <Input style={{flex:1}} type="number" min={1} value={ventaItem.cantidad} onChange={e=>setVentaItem({...ventaItem,cantidad:e.target.value})} placeholder="Cantidad" />
 <Btn color="#00e676" onClick={()=>{ addVentaItem(); setVentaProdSearch(""); }}>＋ AGREGAR</Btn>
 </div>
 {ventaForm.items.map((item,i) => (
 <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #ffffff08", fontSize:12 }}>
 <span style={{color:"#aaa"}}>{item.nombre} × {item.cantidad}</span>
 <span style={{color:"#00e676",fontWeight:900}}>{fmt(item.cantidad*item.precio)}</span>
 </div>
 ))}
 {ventaForm.items.length>0 && (() => {
 const sub = ventaForm.items.reduce((s,i)=>s+i.cantidad*i.precio,0);
 const desc = ventaForm.descuentoModo==="%"
 ? Math.round(sub*Math.min(100,Math.max(0,+ventaForm.descuentoPct||0))/100)
 : Math.min(+ventaForm.descuento||0,sub);
 return (
 <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #ffffff08" }}>
 <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
 <span style={{color:"#555"}}>Subtotal</span><span style={{color:"#aaa"}}>{fmt(sub)}</span>
 </div>
 {desc>0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
 <span style={{color:"#555"}}>Descuento</span><span style={{color:"#ff6b35"}}>− {fmt(desc)}</span>
 </div>}
 <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Orbitron,monospace", fontSize:15, paddingTop:8, borderTop:"1px solid #00e67620" }}>
 <span style={{color:"#444"}}>TOTAL</span>
 <span style={{color:"#00e676",fontWeight:900}}>{fmt(sub-desc)}</span>
 </div>
 </div>
 );
 })()}
 </div>
 </Modal>
 );
 })()}
 {/* Compra */}
 {modal?.type==="compra" && (
 <Modal title={modal.editId?"✏ EDITAR COMPRA":"＋ NUEVA COMPRA"} color="#ff6b35" onClose={()=>setModal(null)} onSave={saveCompra} saveLabel={modal.editId?"ACTUALIZAR":"REGISTRAR COMPRA"}>
 <Grid2>
 <Field label="PROVEEDOR *"><Input value={compraForm.proveedor} onChange={e=>setCompraForm({...compraForm,proveedor:e.target.value})} /></Field>
 <Field label="FECHA"><Input type="date" value={compraForm.fecha} onChange={e=>setCompraForm({...compraForm,fecha:e.target.value})} /></Field>
 </Grid2>
 <Field label="GASTO COURIER / LIBRA (DOP)">
 <Input type="number" value={compraForm.gastoCourier} onChange={e=>setCompraForm({...compraForm,gastoCourier:e.target.value})} placeholder="0 si no aplica" />
 {+compraForm.gastoCourier>0 && <div style={{fontSize:10,color:"#ffd600",marginTop:4}}>✈ {fmt(+compraForm.gastoCourier)} se sumará al total</div>}
 </Field>
 {/* Formulario producto — igual que inventario */}
 <div style={{background:"#0a0a0a",border:"1px solid #ff6b3520",borderRadius:6,padding:16}}>
 <div style={{fontSize:11,color:"#ff6b35",letterSpacing:2,marginBottom:14,fontFamily:"Orbitron,monospace"}}>AGREGAR PRODUCTO A COMPRA</div>
 <Grid2>
 <Field label="NOMBRE PRODUCTO *"><Input value={compraItem.nombre} onChange={e=>setCompraItem({...compraItem,nombre:e.target.value})} placeholder="Ej: Mouse Gamer RGB" /></Field>
 <Field label="CATEGORÍA">
 <div style={{display:"flex",flexDirection:"column",gap:6}}>
 <select value={compraItem.categoria} onChange={e=>setCompraItem({...compraItem,categoria:e.target.value})}
 style={{width:"100%",padding:"10px 14px",border:"1px solid #1a1a1a",borderRadius:4,fontSize:12,background:"#0a0a0a",color:"#e0e0e0",outline:"none",cursor:"pointer",fontFamily:"inherit"}}>
 {(data.categorias||[]).map(c=><option key={c}>{c}</option>)}
 </select>
 {/* Nueva categoría inline */}
 <div style={{display:"flex",gap:6}}>
 <input value={nuevaCatCompra} onChange={e=>setNuevaCatCompra(e.target.value)}
 onKeyDown={e=>{
 if(e.key==="Enter"){
 const cat=nuevaCatCompra.trim();
 if(!cat){return;}
 if((data.categorias||[]).map(c=>c.toLowerCase()).includes(cat.toLowerCase())){showNotify("⚠ Categoría ya existe","error");return;}
 const categorias=[...(data.categorias||[]),cat];
 save({...data,categorias});
 setCompraItem(f=>({...f,categoria:cat}));
 setNuevaCatCompra("");
 showNotify(`✓ Categoría "${cat}" agregada`);
 }
 }}
 placeholder="Nueva categoría..." maxLength={30}
 style={{flex:1,padding:"7px 12px",border:"1px solid #1a1a1a",borderRadius:4,fontSize:11,background:"#0a0a0a",color:"#e0e0e0",outline:"none",fontFamily:"inherit"}} />
 <button onClick={()=>{
 const cat=nuevaCatCompra.trim();
 if(!cat){showNotify("⚠ Escribe el nombre","error");return;}
 if((data.categorias||[]).map(c=>c.toLowerCase()).includes(cat.toLowerCase())){showNotify("⚠ Ya existe","error");return;}
 const categorias=[...(data.categorias||[]),cat];
 save({...data,categorias});
 setCompraItem(f=>({...f,categoria:cat}));
 setNuevaCatCompra("");
 showNotify(`✓ Categoría "${cat}" agregada`);
 }} className="btn-glow"
 style={{background:"#ff6b3515",color:"#ff6b35",border:"1px solid #ff6b3540",borderRadius:4,cursor:"pointer",fontSize:11,padding:"7px 12px",fontFamily:"inherit",fontWeight:700,whiteSpace:"nowrap"}}>
 ＋ AGREGAR
 </button>
 </div>
 </div>
 </Field>
 <Field label="CANTIDAD *"><Input type="number" value={compraItem.cantidad} onChange={e=>setCompraItem({...compraItem,cantidad:e.target.value})} placeholder="Unidades compradas" /></Field>
 <Field label="STOCK MÍNIMO"><Input type="number" value={compraItem.stock_minimo} onChange={e=>setCompraItem({...compraItem,stock_minimo:e.target.value})} /></Field>
 <Field label="COSTO UNITARIO (DOP) *"><Input type="number" value={compraItem.costo} onChange={e=>setCompraItem({...compraItem,costo:e.target.value})} placeholder="Precio que pagaste" /></Field>
 <Field label="PRECIO VENTA (DOP) *"><Input type="number" value={compraItem.precio_venta} onChange={e=>setCompraItem({...compraItem,precio_venta:e.target.value})} placeholder="Precio al cliente" /></Field>
 </Grid2>
 {/* ── Calculadora de costo real con courier ── */}
 {compraItem.cantidad && compraItem.costo && (() => {
 const cant = +compraItem.cantidad || 0;
 const costo = +compraItem.costo || 0;
 const courier = +compraForm.gastoCourier || 0;
 // Total unidades ya agregadas + esta
 const totalUnids = compraForm.items.reduce((s,i)=>s+i.cantidad,0) + cant;
 // Courier proporcional a este producto
 const courierPorUnidad = totalUnids > 0 ? courier / totalUnids : 0;
 const costoReal = costo + courierPorUnidad;
 const pventa = +compraItem.precio_venta || 0;
 const ganancia = pventa - costoReal;
 const margen = costoReal > 0 ? (ganancia / costoReal * 100) : 0;
 return (
 <div style={{marginTop:10,background:"#0d0d0d",border:"1px solid #ffd60030",borderRadius:6,padding:14}}>
 <div style={{fontSize:10,color:"#ffd600",letterSpacing:2,fontFamily:"Orbitron,monospace",marginBottom:10}}>◈ ANÁLISIS DE COSTO REAL POR UNIDAD</div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
 {[
 {label:"Costo unitario", val:fmt(costo), color:"#ff6b35"},
 {label:"Courier ÷ unidades", val:courier>0?fmt(courierPorUnidad):"—", color:"#ffd600", sub: courier>0?`${fmt(courier)} ÷ ${totalUnids} und`:""},
 {label:"COSTO REAL / UND", val:fmt(costoReal), color:"#ff3d57", bold:true},
 {label:"Precio de venta", val:pventa>0?fmt(pventa):"—", color:"#00d4ff"},
 ].map(s=>(
 <div key={s.label} style={{background:"#111",borderRadius:4,padding:"8px 12px"}}>
 <div style={{fontSize:s.bold?14:12,fontWeight:s.bold?900:400,color:s.color}}>{s.val}</div>
 <div style={{fontSize:9,color:"#333",marginTop:2,letterSpacing:1}}>{s.label}</div>
 {s.sub && <div style={{fontSize:9,color:"#555",marginTop:1}}>{s.sub}</div>}
 </div>
 ))}
 </div>
 {pventa > 0 && (
 <div style={{background: ganancia>0?"#00e67615":"#ff3d5715", border:`1px solid ${ganancia>0?"#00e67630":"#ff3d5730"}`, borderRadius:4, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
 <div>
 <div style={{fontSize:11,color:"#555",marginBottom:2}}>Ganancia real por unidad</div>
 <div style={{fontSize:16,fontWeight:900,color:ganancia>0?"#00e676":"#ff3d57"}}>{fmt(ganancia)}</div>
 </div>
 <div style={{textAlign:"right"}}>
 <div style={{fontSize:11,color:"#555",marginBottom:2}}>Margen real</div>
 <div style={{fontSize:18,fontWeight:900,color:margen>0?"#00e676":"#ff3d57"}}>{margen.toFixed(1)}%</div>
 </div>
 </div>
 )}
 {courier > 0 && (
 <div style={{fontSize:10,color:"#555",marginTop:8,letterSpacing:.5}}>
 ✈ El courier de <strong style={{color:"#ffd600"}}>{fmt(courier)}</strong> se divide entre las <strong style={{color:"#ffd600"}}>{totalUnids}</strong> unidades totales → <strong style={{color:"#ffd600"}}>{fmt(courierPorUnidad)}</strong>/und
 </div>
 )}
 </div>
 );
 })()}
 {/* Imagen producto */}
 <Field label="IMAGEN DEL PRODUCTO (opcional)" >
 <div style={{display:"flex",gap:12,alignItems:"center",marginTop:4}}>
 <input ref={imgCompraRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleCompraImgUpload} />
 <button className="btn-glow" onClick={()=>imgCompraRef.current.click()}
 style={{background:"#ff6b3510",color:"#ff6b35",border:"1px solid #ff6b3540",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,padding:"8px 14px"}}>
 SELECCIONAR IMAGEN
 </button>
 {compraItem.imagen
 ? <div style={{position:"relative"}}>
 <img src={compraItem.imagen} alt="" style={{width:56,height:56,objectFit:"cover",borderRadius:4,border:"1px solid #ff6b3540"}} />
 <button onClick={()=>setCompraItem(f=>({...f,imagen:""}))} style={{position:"absolute",top:-6,right:-6,background:"#ff3d57",color:"#fff",border:"none",borderRadius:"50%",width:16,height:16,cursor:"pointer",fontSize:9,fontWeight:900}}>✕</button>
 </div>
 : <div style={{width:56,height:56,border:"1px dashed #333",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}> </div>
 }
 </div>
 </Field>
 <button className="btn-glow" onClick={addCompraItem}
 style={{width:"100%",marginTop:14,background:"#ff6b3520",color:"#ff6b35",border:"1px solid #ff6b3560",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1.5,padding:"10px 0"}}>
 ＋ AGREGAR PRODUCTO A LA COMPRA
 </button>
 </div>
 {/* Lista de productos agregados */}
 {compraForm.items.length>0 && (() => {
 const totalUnids = compraForm.items.reduce((s,i)=>s+i.cantidad,0);
 const courier = +compraForm.gastoCourier||0;
 const courierPorUnidad = totalUnids>0 ? courier/totalUnids : 0;
 return (
 <div style={{background:"#080808",border:"1px solid #ff6b3520",borderRadius:6,padding:16}}>
 <div style={{fontSize:11,color:"#ff6b35",letterSpacing:2,marginBottom:12,fontFamily:"Orbitron,monospace"}}>PRODUCTOS EN ESTA COMPRA</div>
 {compraForm.items.map((item,i)=>{
 const costoReal = item.costo + courierPorUnidad;
 const ganancia = item.precio_venta>0 ? item.precio_venta - costoReal : null;
 return (
 <div key={i} style={{padding:"10px 0",borderBottom:"1px solid #ffffff08"}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
 <div style={{display:"flex",alignItems:"center",gap:8}}>
 {item.imagen && <img src={item.imagen} alt="" style={{width:22,height:22,objectFit:"cover",borderRadius:3,border:"1px solid #ff6b3540"}} />}
 <span style={{color:"#e0e0e0",fontWeight:700,fontSize:12}}>{item.nombre}</span>
 <span style={{color:"#555",fontSize:11}}>× {item.cantidad}</span>
 </div>
 <button onClick={()=>setCompraForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))}
 style={{background:"#ff3d5715",color:"#ff3d57",border:"1px solid #ff3d5740",borderRadius:3,cursor:"pointer",fontSize:10,padding:"2px 7px"}}>✕</button>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
 {[
 {label:"Costo", val:fmt(item.costo), color:"#ff6b35"},
 {label:"Courier/und",val:courier>0?fmt(courierPorUnidad):"—",color:"#ffd600"},
 {label:"Costo real", val:fmt(costoReal), color:"#ff3d57"},
 {label:"P. venta", val:item.precio_venta>0?fmt(item.precio_venta):"—", color:"#00d4ff"},
 ].map(s=>(
 <div key={s.label} style={{background:"#111",borderRadius:3,padding:"5px 8px",textAlign:"center"}}>
 <div style={{fontSize:11,color:s.color,fontWeight:700}}>{s.val}</div>
 <div style={{fontSize:8,color:"#333",marginTop:1,letterSpacing:1}}>{s.label}</div>
 </div>
 ))}
 </div>
 {ganancia!==null && (
 <div style={{marginTop:5,fontSize:10,color:ganancia>0?"#00e676":"#ff3d57"}}>
 Ganancia real: <strong>{fmt(ganancia)}</strong> / und
 {" · "}Margen: <strong>{costoReal>0?(ganancia/costoReal*100).toFixed(1):0}%</strong>
 </div>
 )}
 </div>
 );
 })}
 <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #ffffff08"}}>
 <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
 <span style={{color:"#555"}}>Subtotal productos</span>
 <span style={{color:"#aaa"}}>{fmt(compraForm.items.reduce((s,i)=>s+i.cantidad*i.costo,0))}</span>
 </div>
 {courier>0 && (
 <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
 <span style={{color:"#555"}}>✈ Courier ({totalUnids} und · {fmt(courierPorUnidad)}/und)</span>
 <span style={{color:"#ffd600"}}>{fmt(courier)}</span>
 </div>
 )}
 <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Orbitron,monospace",fontSize:15,paddingTop:8,borderTop:"1px solid #ff6b3520"}}>
 <span style={{color:"#444"}}>TOTAL COMPRA</span>
 <span style={{color:"#ff6b35",fontWeight:900}}>{fmt(compraForm.items.reduce((s,i)=>s+i.cantidad*i.costo,0)+courier)}</span>
 </div>
 </div>
 </div>
 );
 })()}
 </Modal>
 )}
 {/* Deuda */}
 {modal?.type==="deuda" && (
 <Modal title="＋ REGISTRAR DEUDA" color="#ff3d57" onClose={()=>setModal(null)} onSave={saveDeuda} saveLabel="REGISTRAR">
 <Grid2>
 <Field label="CLIENTE *">
 <Select value={deudaForm.cliente_id} onChange={e=>setDeudaForm({...deudaForm,cliente_id:e.target.value})}>
 <option value="">Seleccionar cliente...</option>
 {data.clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
 </Select>
 </Field>
 <Field label="FECHA VENCIMIENTO"><Input type="date" value={deudaForm.fecha_vencimiento} onChange={e=>setDeudaForm({...deudaForm,fecha_vencimiento:e.target.value})} /></Field>
 </Grid2>
 <Field label="DESCRIPCIÓN / NOTA">
 <Input value={deudaForm.descripcion} onChange={e=>setDeudaForm({...deudaForm,descripcion:e.target.value})} placeholder="Se llena automático al agregar productos..." />
 </Field>
 {/* Selector de productos del inventario */}
 <div style={{ background:"#0a0a0a", border:"1px solid #ff3d5720", borderRadius:6, padding:16 }}>
 <div style={{ fontSize:11, color:"#ff3d57", letterSpacing:2, marginBottom:12, fontFamily:"Orbitron,monospace" }}>
 PRODUCTOS DEL INVENTARIO
 </div>
 <div style={{ display:"flex", gap:8, marginBottom:12 }}>
 <Select style={{flex:2}} value={deudaItem.producto_id} onChange={e=>setDeudaItem({...deudaItem,producto_id:e.target.value})}>
 <option value="">Seleccionar producto...</option>
 {data.productos.filter(p=>p.stock>0).map(p=>(
 <option key={p.id} value={p.id}>{p.nombre} — {fmt(p.precio_venta)} (stock: {p.stock})</option>
 ))}
 </Select>
 <Input style={{width:70}} type="number" min={1} value={deudaItem.cantidad} onChange={e=>setDeudaItem({...deudaItem,cantidad:e.target.value})} placeholder="Cant" />
 <Btn color="#ff3d57" onClick={addDeudaItem}>＋</Btn>
 </div>
 {deudaForm.items.map((item,i) => (
 <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #ffffff08", fontSize:12 }}>
 <span style={{color:"#aaa"}}>{item.nombre} × {item.cantidad}</span>
 <div style={{ display:"flex", alignItems:"center", gap:8 }}>
 <span style={{color:"#ff3d57",fontWeight:900}}>{fmt(item.cantidad*item.precio)}</span>
 <button onClick={()=>removeDeudaItem(i)} style={{ background:"#ff3d5715", color:"#ff3d57", border:"1px solid #ff3d5740", borderRadius:3, cursor:"pointer", fontSize:10, padding:"2px 7px" }}>✕</button>
 </div>
 </div>
 ))}
 {deudaForm.items.length > 0 && (
 <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0", fontFamily:"Orbitron,monospace", fontSize:15 }}>
 <span style={{color:"#444"}}>TOTAL DEUDA</span>
 <span style={{color:"#ff3d57",fontWeight:900}}>{fmt(deudaForm.items.reduce((s,i)=>s+i.cantidad*i.precio,0))}</span>
 </div>
 )}
 </div>
 {deudaForm.items.length > 0 && (
 <div style={{ background:"#ff3d5710", border:"1px solid #ff3d5730", borderRadius:4, padding:"10px 16px", fontSize:12, color:"#ff3d57" }}>
 ⚠ Al guardar, el stock de los productos seleccionados se descontará automáticamente del inventario.
 </div>
 )}
 </Modal>
 )}
 {/* ── MODAL ABONO — NUEVO ─────────────────────────────────────────── */}
 {modal?.type==="abono" && (() => {
 const d = data.deudas.find(x => x.id === modal.deudaId);
 const pendiente = d ? d.monto - d.monto_pagado : 0;
 return (
 <Modal title=" REGISTRAR ABONO" color="#ffd600" onClose={()=>setModal(null)} onSave={()=>saveAbono(modal.deudaId)} saveLabel="REGISTRAR ABONO">
 <div style={{ background:"#ffd60010", border:"1px solid #ffd60030", borderRadius:6, padding:16, fontSize:12 }}>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><span style={{color:"#666"}}>Cliente:</span><strong style={{color:"#e0e0e0"}}>{d?.cliente_nombre}</strong></div>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><span style={{color:"#666"}}>Deuda total:</span><strong style={{color:"#ff3d57"}}>{fmt(d?.monto)}</strong></div>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><span style={{color:"#666"}}>Ya pagado:</span><strong style={{color:"#00e676"}}>{fmt(d?.monto_pagado)}</strong></div>
 <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{color:"#666"}}>Pendiente:</span><strong style={{color:"#ffd600"}}>{fmt(pendiente)}</strong></div>
 </div>
 <Field label="MONTO DEL ABONO (DOP) *">
 <Input type="number" value={abonoForm.monto} onChange={e=>setAbonoForm({...abonoForm,monto:e.target.value})} placeholder={`Máx: ${fmt(pendiente)}`} />
 </Field>
 <Field label="NOTA (opcional)">
 <Input value={abonoForm.nota} onChange={e=>setAbonoForm({...abonoForm,nota:e.target.value})} placeholder="Ej: Abono en efectivo..." />
 </Field>
 </Modal>
 );
 })()}
 {/* ── MODAL COTIZACIÓN ─────────────────────────────────────────── */}
 {modal?.type==="cotizacion" && (() => {
 const subtotalPreview = cotForm.items.reduce((s,i) => s + i.cantidad*i.precio, 0);
 const descuentoMonto = cotForm.descuentoModo === "%"
 ? Math.round(subtotalPreview * Math.min(100,Math.max(0,+cotForm.descuentoPct||0)) / 100)
 : Math.min(+cotForm.descuento||0, subtotalPreview);
 const totalPreview = subtotalPreview - descuentoMonto;
 const clientesFiltrados = data.clientes.filter(c =>
 c.nombre.toLowerCase().includes(cotClientSearch.toLowerCase()) ||
 (c.cedula||"").includes(cotClientSearch) ||
 (c.telefono||"").includes(cotClientSearch)
 );
 const clienteSeleccionado = data.clientes.find(c => c.id === +cotForm.cliente_id);
 return (
 <Modal title=" NUEVA COTIZACIÓN" color="#a78bfa" onClose={()=>setModal(null)} onSave={saveCotizacion} saveLabel="GUARDAR COTIZACIÓN">
 {/* ── CLIENTE con buscador controlado ── */}
 <Field label="CLIENTE *">
 <div style={{ position:"relative" }}>
 <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#a78bfa", fontSize:11, pointerEvents:"none", zIndex:1 }}> </span>
 <input
 value={cotClientSearch}
 onChange={e=>{
 setCotClientSearch(e.target.value);
 setCotForm(f=>({...f, cliente_id:""}));
 }}
 placeholder="Escribe para buscar cliente..."
 autoComplete="off"
 style={{ width:"100%", padding:"10px 34px 10px 28px", border:`1px solid ${cotForm.cliente_id?"#a78bfa60":"#a78bfa20"}`, borderRadius: cotClientSearch && !cotForm.cliente_id && clientesFiltrados.length > 0 ? "4px 4px 0 0" : "4px", fontSize:12, fontFamily:"inherit", background:"#0a0a0a", color: cotForm.cliente_id?"#a78bfa":"#e0e0e0", outline:"none", letterSpacing:.5 }}
 />
 {cotClientSearch && (
 <button onClick={()=>{ setCotClientSearch(""); setCotForm(f=>({...f,cliente_id:""})); }}
 style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#ff3d57", cursor:"pointer", fontSize:13, padding:2, zIndex:1 }}>✕</button>
 )}
 {/* Dropdown solo aparece cuando hay texto escrito y no hay cliente seleccionado */}
 {cotClientSearch && !cotForm.cliente_id && clientesFiltrados.length > 0 && (
 <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#0d0d0d", border:"1px solid #a78bfa40", borderTop:"none", borderRadius:"0 0 4px 4px", zIndex:50, maxHeight:180, overflowY:"auto" }}>
 {clientesFiltrados.map(c=>(
 <div key={c.id}
 onClick={()=>{ setCotForm(f=>({...f,cliente_id:String(c.id)})); setCotClientSearch(c.nombre); }}
 style={{ padding:"9px 14px", cursor:"pointer", fontSize:12, borderBottom:"1px solid #ffffff06", display:"flex", justifyContent:"space-between", alignItems:"center" }}
 onMouseEnter={e=>e.currentTarget.style.background="#a78bfa15"}
 onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
 <span style={{color:"#e0e0e0", fontWeight:600}}>{c.nombre}</span>
 <span style={{color:"#444", fontSize:11}}>{c.cedula||c.telefono||""}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 {/* Confirmación cliente seleccionado */}
 {clienteSeleccionado && (
 <div style={{ background:"#a78bfa10", border:"1px solid #a78bfa30", borderRadius:4, padding:"7px 12px", fontSize:11, color:"#a78bfa", marginTop:5, display:"flex", justifyContent:"space-between" }}>
 <span>✓ <strong>{clienteSeleccionado.nombre}</strong></span>
 <span style={{color:"#555"}}>{clienteSeleccionado.telefono||""}{clienteSeleccionado.ciudad?` · ${clienteSeleccionado.ciudad}`:""}</span>
 </div>
 )}
 {cotClientSearch && !cotForm.cliente_id && clientesFiltrados.length===0 && (
 <div style={{ fontSize:11, color:"#555", marginTop:5 }}>Sin resultados para "{cotClientSearch}"</div>
 )}
 </Field>
 <Grid2>
 <Field label="FECHA"><Input type="date" value={cotForm.fecha} onChange={e=>setCotForm({...cotForm,fecha:e.target.value})} /></Field>
 <Field label="VÁLIDA HASTA"><Input type="date" value={cotForm.validez} onChange={e=>setCotForm({...cotForm,validez:e.target.value})} /></Field>
 <Field label="NOTAS / CONDICIONES">
 <Input value={cotForm.notas} onChange={e=>setCotForm({...cotForm,notas:e.target.value})} placeholder="Ej: Precios sujetos a disponibilidad..." />
 </Field>
 </Grid2>
 <DescuentoField
 subtotal={subtotalPreview}
 modo={cotForm.descuentoModo}
 monto={cotForm.descuento}
 pct={cotForm.descuentoPct}
 color="#a78bfa"
 fmt={fmt}
 onModoChange={v=>setCotForm(f=>({...f,descuentoModo:v,descuento:"0",descuentoPct:"0"}))}
 onMontoChange={v=>setCotForm(f=>({...f,descuento:v}))}
 onPctChange={v=>setCotForm(f=>({...f,descuentoPct:v}))}
 />
 <div style={{ background:"#0a0a0a", border:"1px solid #a78bfa20", borderRadius:6, padding:16 }}>
 <div style={{ fontSize:11, color:"#a78bfa", letterSpacing:2, marginBottom:12, fontFamily:"Orbitron,monospace" }}>AGREGAR PRODUCTOS</div>
 {/* Buscador de producto */}
 <div style={{ position:"relative", marginBottom:8 }}>
 <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#a78bfa", fontSize:11, pointerEvents:"none" }}> </span>
 <input
 value={cotProdSearch}
 onChange={e=>{ setCotProdSearch(e.target.value); setCotItem({...cotItem, producto_id:""}); }}
 placeholder="Buscar producto por nombre..."
 style={{ width:"100%", padding:"8px 32px 8px 28px", border:"1px solid #a78bfa20", borderRadius:4, fontSize:12, fontFamily:"inherit", background:"#111", color:"#e0e0e0", outline:"none", letterSpacing:.5 }}
 />
 {cotProdSearch && (
 <button onClick={()=>{ setCotProdSearch(""); setCotItem({...cotItem, producto_id:""}); }}
 style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#ff3d57", cursor:"pointer", fontSize:13, padding:2 }}>✕</button>
 )}
 </div>
 {/* Selector desplegable filtrado + cantidad + agregar */}
 <div style={{ display:"flex", gap:8, marginBottom:12 }}>
 <select
 style={{ flex:2, padding:"10px 14px", border:`1px solid ${cotItem.producto_id?"#a78bfa60":"#1a1a1a"}`, borderRadius:4, fontSize:12, background:"#0a0a0a", color: cotItem.producto_id?"#a78bfa":"#666", outline:"none", cursor:"pointer", fontFamily:"inherit" }}
 value={cotItem.producto_id}
 onChange={e=>setCotItem({...cotItem, producto_id:e.target.value})}
 size={Math.min(6, data.productos.filter(p=>p.nombre.toLowerCase().includes(cotProdSearch.toLowerCase())).length + 1)}
 >
 <option value="">— Seleccionar producto —</option>
 {data.productos
 .filter(p => p.nombre.toLowerCase().includes(cotProdSearch.toLowerCase()))
 .map(p=>(
 <option key={p.id} value={p.id}>
 {p.nombre} — {fmt(p.precio_venta)} | stock: {p.stock}
 </option>
 ))
 }
 </select>
 <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
 <Input style={{width:70}} type="number" min={1} value={cotItem.cantidad} onChange={e=>setCotItem({...cotItem,cantidad:e.target.value})} placeholder="Cant" />
 <Btn color="#a78bfa" onClick={()=>{ addCotItem(); setCotProdSearch(""); }} style={{padding:"8px 14px", fontSize:11}}>＋ AGREGAR</Btn>
 </div>
 </div>
 {/* Producto seleccionado preview */}
 {cotItem.producto_id && (() => {
 const sel = data.productos.find(p=>p.id===+cotItem.producto_id);
 return sel ? (
 <div style={{ background:"#a78bfa10", border:"1px solid #a78bfa30", borderRadius:4, padding:"8px 12px", fontSize:11, color:"#a78bfa", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
 <span>✓ <strong>{sel.nombre}</strong></span>
 <span>{fmt(sel.precio_venta)} × {cotItem.cantidad} = <strong>{fmt(sel.precio_venta * (+cotItem.cantidad||0))}</strong></span>
 </div>
 ) : null;
 })()}
 {cotForm.items.map((item,i) => (
 <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #ffffff08", fontSize:12 }}>
 <span style={{color:"#aaa"}}>{item.nombre} × {item.cantidad}</span>
 <span style={{color:"#a78bfa",fontWeight:900}}>{fmt(item.cantidad*item.precio)}</span>
 </div>
 ))}
 {cotForm.items.length > 0 && (
 <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #ffffff08" }}>
 <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
 <span style={{color:"#555"}}>Subtotal</span>
 <span style={{color:"#aaa"}}>{fmt(subtotalPreview)}</span>
 </div>
 {descuentoMonto > 0 && (
 <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
 <span style={{color:"#555"}}>Descuento{cotForm.descuentoModo==="%"?` (${cotForm.descuentoPct}%)`:""}</span>
 <span style={{color:"#ff6b35"}}>− {fmt(descuentoMonto)}</span>
 </div>
 )}
 <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Orbitron,monospace", fontSize:15, paddingTop:8, borderTop:"1px solid #a78bfa20" }}>
 <span style={{color:"#444"}}>TOTAL</span>
 <span style={{color:"#a78bfa",fontWeight:900}}>{fmt(totalPreview)}</span>
 </div>
 </div>
 )}
 </div>
 </Modal>
 );
 })()}
 {/* Editar Venta */}
 {modal?.type==="editVenta" && modal.venta && (
 <EditVentaModal
 venta={modal.venta}
 data={data}
 fmt={fmt}
 today={today}
 nextId={nextId}
 onClose={()=>setModal(null)}
 onSave={(ventas, deudas)=>{
 save({...data, ventas, deudas});
 showNotify("✓ Venta actualizada y deuda sincronizada");
 setModal(null);
 }}
 />
 )}
 {/* Editar Deuda */}
 {modal?.type==="editDeuda" && modal.deudaId && (() => {
 const d = data.deudas.find(x=>x.id===modal.deudaId);
 if (!d) return null;
 return (
 <Modal title={`✏ EDITAR DEUDA — ${d.cliente_nombre}`} color="#a78bfa" onClose={()=>setModal(null)} onSave={()=>saveEditDeuda(modal.deudaId)} saveLabel="GUARDAR CAMBIOS">
 <div style={{ background:"#a78bfa10", border:"1px solid #a78bfa30", borderRadius:6, padding:14, fontSize:12 }}>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{color:"#555"}}>Descripción:</span><span style={{color:"#aaa"}}>{d.descripcion}</span></div>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{color:"#555"}}>Monto total:</span><strong style={{color:"#ff3d57"}}>{fmt(d.monto)}</strong></div>
 <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{color:"#555"}}>Pagado actual:</span><strong style={{color:"#00e676"}}>{fmt(d.monto_pagado)}</strong></div>
 </div>
 <Field label="NUEVO MONTO PAGADO (DOP) *">
 <Input type="number" value={abonoForm.monto} onChange={e=>setAbonoForm({...abonoForm,monto:e.target.value})} placeholder={`Máx: ${fmt(d.monto)}`} />
 </Field>
 {+abonoForm.monto >= 0 && abonoForm.monto !== "" && (
 <div style={{ background:"#a78bfa10", border:"1px solid #a78bfa30", borderRadius:4, padding:"9px 14px", fontSize:11, color:"#a78bfa" }}>
 Pendiente quedará: <strong>{fmt(Math.max(0, d.monto-(+abonoForm.monto||0)))}</strong>
 {+abonoForm.monto >= d.monto && <span style={{color:"#00e676",marginLeft:8}}>✓ Quedará PAGADO — venta vinculada también se actualizará</span>}
 </div>
 )}
 </Modal>
 );
 })()}
 {/* ── MODAL REPORTE POR RANGO DE FECHAS ─────────────────────────── */}
 {reporteModal && (
 <ReporteModal
 data={data}
 fmt={fmt}
 MESES={MESES}
 rango={reporteRango}
 setRango={setReporteRango}
 onClose={()=>{ setReporteModal(false); setReporteRango({desde:"",hasta:""}); }}
 />
 )}
 </div>
 );
}
// ═══ COMPONENTES INTERNOS ══════════════════════════════════════════════════
function Btn({ children, color="#00d4ff", onClick, style={} }) {
 return (
 <button className="btn-glow" onClick={onClick} style={{ background:`${color}20`, color, border:`1px solid ${color}60`, padding:"10px 20px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", transition:"all .2s", ...style }}>
 {children}
 </button>
 );
}
function BtnSm({ children, color, onClick }) {
 return (
 <button className="btn-glow" onClick={onClick} style={{ background:`${color}15`, color, border:`1px solid ${color}40`, padding:"4px 10px", borderRadius:3, cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700, letterSpacing:.5, transition:"all .2s" }}>
 {children}
 </button>
 );
}
function Tag({ children, color }) {
 return <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:700, background:`${color}20`, color, letterSpacing:.5, border:`1px solid ${color}40` }}>{children}</span>;
}
function Table({ headers, children }) {
 return (
 <div style={{ background:"#080808", border:"1px solid #00d4ff15", borderRadius:6, overflow:"hidden" }}>
 <table style={{ width:"100%", borderCollapse:"collapse" }}>
 <thead>
 <tr style={{ background:"#050505" }}>
 {headers.map(h => <th key={h} style={{ padding:"12px 16px", fontSize:10, fontWeight:700, color:"#333", letterSpacing:1.5, textAlign:"left", borderBottom:"1px solid #00d4ff15", fontFamily:"Orbitron,monospace" }}>{h}</th>)}
 </tr>
 </thead>
 <tbody>{children}</tbody>
 </table>
 </div>
 );
}
function TD({ children, color }) {
 return <td style={{ padding:"12px 16px", fontSize:12, borderBottom:"1px solid #ffffff05", color:color||"#aaa" }}>{children}</td>;
}
function SearchBar({ value, onChange, placeholder }) {
 return (
 <input style={{ width:"100%", maxWidth:380, padding:"10px 16px", border:"1px solid #00d4ff20", borderRadius:4, fontSize:12, fontFamily:"inherit", background:"#080808", color:"#e0e0e0", outline:"none", marginBottom:16, letterSpacing:.5 }}
 placeholder={`◈ ${placeholder}`} value={value} onChange={e=>onChange(e.target.value)} />
 );
}
function Modal({ title, color, onClose, onSave, saveLabel, children }) {
 return (
 <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}
 onClick={e=>e.target===e.currentTarget&&onClose()}>
 <div className="fade-in" style={{ background:"#080808", border:`1px solid ${color}30`, borderRadius:8, width:"100%", maxWidth:640, maxHeight:"90vh", overflowY:"auto", boxShadow:`0 0 60px ${color}20` }}>
 <div style={{ padding:"22px 28px", borderBottom:`1px solid ${color}20` }}>
 <h2 style={{ fontFamily:"Orbitron,monospace", fontSize:15, fontWeight:900, color, letterSpacing:2 }}>{title}</h2>
 </div>
 <div style={{ padding:"22px 28px", display:"flex", flexDirection:"column", gap:14 }}>{children}</div>
 <div style={{ padding:"16px 28px", borderTop:`1px solid ${color}15`, display:"flex", gap:10, justifyContent:"flex-end" }}>
 <button className="btn-glow" onClick={onClose} style={{ background:"transparent", color:"#444", border:"1px solid #222", padding:"10px 20px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, letterSpacing:1 }}>CANCELAR</button>
 <button className="btn-glow" onClick={onSave} style={{ background:`${color}20`, color, border:`1px solid ${color}`, padding:"10px 24px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, letterSpacing:1.5, boxShadow:`0 0 15px ${color}30` }}>✓ {saveLabel}</button>
 </div>
 </div>
 </div>
 );
}
function Field({ label, children }) {
 return (
 <div>
 <label style={{ fontSize:10, fontWeight:700, color:"#333", display:"block", marginBottom:6, letterSpacing:1.5, fontFamily:"Orbitron,monospace" }}>{label}</label>
 {children}
 </div>
 );
}
function Input({ style={}, ...props }) {
 return <input {...props} style={{ width:"100%", padding:"10px 14px", border:"1px solid #1a1a1a", borderRadius:4, fontSize:12, background:"#0a0a0a", color:"#e0e0e0", outline:"none", transition:"border-color .2s", ...style }}
 onFocus={e=>e.target.style.borderColor="#00d4ff40"} onBlur={e=>e.target.style.borderColor="#1a1a1a"} />;
}
function Select({ children, style={}, ...props }) {
 return <select {...props} style={{ width:"100%", padding:"10px 14px", border:"1px solid #1a1a1a", borderRadius:4, fontSize:12, background:"#0a0a0a", color:"#e0e0e0", outline:"none", cursor:"pointer", ...style }}>{children}</select>;
}
function Grid2({ children }) {
 return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>;
}
// ── ReporteModal — selector de rango + vista previa + imprimir (sin popups) ──
function ReporteModal({ data, fmt, MESES, rango, setRango, onClose }) {
 const [vista, setVista] = React.useState(false);
 const printRef = React.useRef(null);
 const filtrar = () => {
 if (!rango.desde || !rango.hasta) return null;
 const desde = new Date(rango.desde);
 const hasta = new Date(rango.hasta);
 hasta.setHours(23,59,59);
 const ventas = data.ventas.filter(v=>{ const f=new Date(v.fecha); return f>=desde&&f<=hasta; });
 const compras = data.compras.filter(c=>{ const f=new Date(c.fecha); return f>=desde&&f<=hasta; });
 const totalV = ventas.reduce((s,v)=>s+v.total,0);
 const totalC = compras.reduce((s,c)=>s+(c.total||0),0);
 const ganancia= totalV-totalC;
 const rentab = totalC>0?((ganancia/totalC)*100).toFixed(1):0;
 const deudas = data.deudas.filter(d=>{ const f=new Date(d.fecha_registro); return f>=desde&&f<=hasta&&d.estado!=="Pagado"; });
 const totalD = deudas.reduce((s,d)=>s+(d.monto-d.monto_pagado),0);
 const mesesData = MESES.map((m,i)=>({
 mes:m,
 ventas: ventas.filter(v=>new Date(v.fecha).getMonth()===i).reduce((s,v)=>s+v.total,0),
 compras: compras.filter(c=>new Date(c.fecha).getMonth()===i).reduce((s,c)=>s+(c.total||0),0),
 }));
 const maxBar = Math.max(...mesesData.map(m=>Math.max(m.ventas,m.compras)),1);
 const topProds = [...data.productos].filter(p=>p.precio_compra>0)
 .map(p=>({...p,mp:(((p.precio_venta-p.precio_compra)/p.precio_compra)*100)}))
 .sort((a,b)=>b.mp-a.mp).slice(0,8);
 return { ventas, compras, totalV, totalC, ganancia, rentab, deudas, totalD, mesesData, maxBar, topProds };
 };
 const res = filtrar();
 const rangoValido = rango.desde && rango.hasta && new Date(rango.desde)<=new Date(rango.hasta);
 const generarPDF = async () => {
 if (!res) return;
 // Cargar jsPDF dinámicamente desde CDN
 if (!window.jspdf) {
 await new Promise((resolve, reject) => {
 const s = document.createElement("script");
 s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
 s.onload = resolve;
 s.onerror = reject;
 document.head.appendChild(s);
 });
 }
 const { jsPDF } = window.jspdf;
 const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
 const ancho = doc.internal.pageSize.getWidth();
 const margen = 15;
 let y = 20;
 const fmtNum = n => new Intl.NumberFormat("es-DO",{style:"currency",currency:"DOP",maximumFractionDigits:0}).format(n||0);
 const addTitle = (txt, size=11, color=[0,100,210]) => {
 doc.setFontSize(size); doc.setTextColor(...color); doc.setFont(undefined,"bold");
 doc.text(txt, margen, y); y += size*0.5;
 };
 const addLine = () => { doc.setDrawColor(50,50,50); doc.line(margen, y, ancho-margen, y); y += 4; };
 const addRow = (label, val, colorVal=[200,200,200]) => {
 doc.setFontSize(9); doc.setFont(undefined,"normal"); doc.setTextColor(130,130,130);
 doc.text(label, margen, y);
 doc.setTextColor(...colorVal); doc.setFont(undefined,"bold");
 doc.text(String(val), ancho-margen, y, {align:"right"});
 y += 6;
 };
 // ── Encabezado ──
 doc.setFillColor(15,15,40); doc.rect(0,0,ancho,28,"F");
 doc.setFontSize(18); doc.setFont(undefined,"bold"); doc.setTextColor(0,212,255);
 doc.text("NEXU", margen, 13);
 doc.setTextColor(255,107,53); doc.text("STORE", margen+22, 13);
 doc.setTextColor(255,107,53); doc.text(" RD", margen+50, 13);
 doc.setFontSize(8); doc.setTextColor(100,100,100); doc.setFont(undefined,"normal");
 doc.text("REPORTE FINANCIERO POR PERÍODO", margen, 20);
 doc.text(`Período: ${rango.desde} al ${rango.hasta}`, ancho-margen, 13, {align:"right"});
 doc.text(`Generado: ${new Date().toLocaleDateString("es-DO")}`, ancho-margen, 20, {align:"right"});
 y = 36;
 // ── Resumen 4 tarjetas ──
 addTitle("RESUMEN FINANCIERO", 11, [0,212,255]); y += 2;
 const cards = [
 {l:"Ingresos Totales", v:fmtNum(res.totalV), c:[0,230,118]},
 {l:"Gastos Totales", v:fmtNum(res.totalC), c:[255,107,53]},
 {l:"Ganancia Neta", v:fmtNum(res.ganancia), c:res.ganancia>=0?[0,212,255]:[255,61,87]},
 {l:"Rentabilidad", v:`${res.rentab}%`, c:res.rentab>0?[0,230,118]:[255,61,87]},
 ];
 const cw=(ancho-margen*2-9)/4;
 cards.forEach((c,i)=>{
 const x=margen+i*(cw+3);
 doc.setFillColor(20,20,30); doc.roundedRect(x,y,cw,18,2,2,"F");
 doc.setFontSize(13); doc.setFont(undefined,"bold"); doc.setTextColor(...c.c);
 doc.text(c.v, x+cw/2, y+9, {align:"center"});
 doc.setFontSize(7); doc.setFont(undefined,"normal"); doc.setTextColor(80,80,80);
 doc.text(c.l, x+cw/2, y+14, {align:"center"});
 });
 y += 24;
 addLine();
 // ── Ventas del período ──
 addTitle(`VENTAS DEL PERÍODO (${res.ventas.length})`, 10, [0,230,118]); y += 2;
 if (res.ventas.length===0) { doc.setFontSize(9); doc.setTextColor(80,80,80); doc.text("Sin ventas en este período", margen, y); y+=6; }
 res.ventas.forEach(v=>{
 if(y>270){ doc.addPage(); y=20; }
 doc.setFontSize(9); doc.setFont(undefined,"bold"); doc.setTextColor(200,200,200);
 doc.text(`${v.codigo} — ${v.cliente_nombre}`, margen, y);
 doc.setTextColor(0,230,118); doc.text(fmtNum(v.total), ancho-margen, y, {align:"right"});
 doc.setFontSize(7); doc.setFont(undefined,"normal"); doc.setTextColor(80,80,80);
 doc.text(`${v.fecha} · ${v.estado}`, margen, y+4);
 y += 9;
 });
 y += 2; addLine();
 // ── Compras del período ──
 addTitle(`COMPRAS DEL PERÍODO (${res.compras.length})`, 10, [255,107,53]); y += 2;
 if (res.compras.length===0) { doc.setFontSize(9); doc.setTextColor(80,80,80); doc.text("Sin compras en este período", margen, y); y+=6; }
 res.compras.forEach(c=>{
 if(y>270){ doc.addPage(); y=20; }
 doc.setFontSize(9); doc.setFont(undefined,"bold"); doc.setTextColor(200,200,200);
 doc.text(`${c.codigo} — ${c.proveedor}`, margen, y);
 doc.setTextColor(255,107,53); doc.text(fmtNum(c.total), ancho-margen, y, {align:"right"});
 doc.setFontSize(7); doc.setFont(undefined,"normal"); doc.setTextColor(80,80,80);
 doc.text(c.fecha, margen, y+4);
 y += 9;
 });
 y += 2; addLine();
 // ── Margen por producto ──
 if(y>220){ doc.addPage(); y=20; }
 addTitle("MARGEN POR PRODUCTO — TOP 8", 10, [0,212,255]); y += 2;
 res.topProds.forEach((p,i)=>{
 if(y>270){ doc.addPage(); y=20; }
 const color = p.mp>=60?[0,230,118]:p.mp>=30?[255,214,0]:[255,61,87];
 doc.setFontSize(9); doc.setFont(undefined,"bold"); doc.setTextColor(200,200,200);
 doc.text(`${i+1}. ${p.nombre}`, margen, y);
 doc.setTextColor(...color); doc.text(`${p.mp.toFixed(1)}%`, ancho-margen, y, {align:"right"});
 doc.setFontSize(7); doc.setFont(undefined,"normal"); doc.setTextColor(80,80,80);
 doc.text(`Costo: ${fmtNum(p.precio_compra)} · Venta: ${fmtNum(p.precio_venta)} · Ganancia: ${fmtNum(p.precio_venta-p.precio_compra)}`, margen, y+4);
 // barra de margen
 const bw=ancho-margen*2-30;
 doc.setFillColor(30,30,30); doc.rect(margen, y+6, bw, 2, "F");
 doc.setFillColor(...color); doc.rect(margen, y+6, bw*Math.min(1,p.mp/100), 2, "F");
 y += 12;
 });
 // ── Deudas ──
 if(res.deudas.length>0){
 y += 2; addLine();
 if(y>240){ doc.addPage(); y=20; }
 addTitle(`DEUDAS PENDIENTES (${res.deudas.length}) — ${fmtNum(res.totalD)}`, 10, [255,61,87]); y+=2;
 res.deudas.forEach(d=>{
 if(y>270){ doc.addPage(); y=20; }
 doc.setFontSize(9); doc.setFont(undefined,"bold"); doc.setTextColor(200,200,200);
 doc.text(d.cliente_nombre, margen, y);
 doc.setTextColor(255,214,0); doc.text(fmtNum(d.monto-d.monto_pagado), ancho-margen, y, {align:"right"});
 doc.setFontSize(7); doc.setFont(undefined,"normal"); doc.setTextColor(80,80,80);
 doc.text(d.descripcion, margen, y+4);
 y += 9;
 });
 }
 // ── Footer ──
 const pags = doc.internal.getNumberOfPages();
 for(let i=1;i<=pags;i++){
 doc.setPage(i);
 doc.setFontSize(7); doc.setTextColor(50,50,50);
 doc.text("NexuStoreRD — Accesorios de PC | Santo Domingo, Rep. Dominicana", margen, 292);
 doc.text(`Página ${i} de ${pags}`, ancho-margen, 292, {align:"right"});
 }
 doc.save(`NexuStoreRD_Reporte_${rango.desde}_${rango.hasta}.pdf`);
 };
 return (
 <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}}
 onClick={e=>e.target===e.currentTarget&&onClose()}>
 <div className="fade-in" style={{background:"#080808",border:"1px solid #a78bfa30",borderRadius:12,width:"100%",maxWidth:vista&&res?920:500,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 0 60px #a78bfa15",transition:"max-width .35s"}}>
 {/* Header */}
 <div style={{padding:"20px 28px",borderBottom:"1px solid #a78bfa20",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#080808",zIndex:10}}>
 <div>
 <h2 style={{fontFamily:"Orbitron,monospace",fontSize:15,fontWeight:900,color:"#a78bfa",letterSpacing:2}}> GENERAR REPORTE</h2>
 <div style={{fontSize:10,color:"#444",marginTop:4,letterSpacing:1}}>Selecciona el rango de fechas</div>
 </div>
 <button onClick={onClose} style={{background:"none",border:"1px solid #ff3d5740",borderRadius:4,color:"#ff3d57",cursor:"pointer",fontFamily:"inherit",fontSize:12,padding:"6px 12px"}}>✕ CERRAR</button>
 </div>
 <div style={{padding:"22px 28px",display:"flex",flexDirection:"column",gap:16}}>
 {/* Selector fechas */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
 <div>
 <label style={{fontSize:10,fontWeight:700,color:"#333",display:"block",marginBottom:6,letterSpacing:1.5,fontFamily:"Orbitron,monospace"}}>DESDE *</label>
 <input type="date" value={rango.desde} onChange={e=>{setRango({...rango,desde:e.target.value});setVista(false);}}
 style={{width:"100%",padding:"10px 14px",border:"1px solid #a78bfa30",borderRadius:4,fontSize:12,background:"#0a0a0a",color:"#e0e0e0",outline:"none",fontFamily:"inherit"}} />
 </div>
 <div>
 <label style={{fontSize:10,fontWeight:700,color:"#333",display:"block",marginBottom:6,letterSpacing:1.5,fontFamily:"Orbitron,monospace"}}>HASTA *</label>
 <input type="date" value={rango.hasta} onChange={e=>{setRango({...rango,hasta:e.target.value});setVista(false);}}
 style={{width:"100%",padding:"10px 14px",border:"1px solid #a78bfa30",borderRadius:4,fontSize:12,background:"#0a0a0a",color:"#e0e0e0",outline:"none",fontFamily:"inherit"}} />
 </div>
 </div>
 {/* Botones acción */}
 {rangoValido && (
 <div style={{display:"flex",gap:10}}>
 <button onClick={()=>setVista(true)} className="btn-glow"
 style={{flex:1,background:"#00d4ff20",color:"#00d4ff",border:"1px solid #00d4ff60",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1.5,padding:"12px 0",textTransform:"uppercase"}}>
 VISUALIZAR
 </button>
 {vista && res && (
 <button onClick={generarPDF} className="btn-glow"
 style={{flex:1,background:"#a78bfa20",color:"#a78bfa",border:"1px solid #a78bfa60",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1.5,padding:"12px 0",textTransform:"uppercase"}}>
 DESCARGAR PDF
 </button>
 )}
 </div>
 )}
 {/* Error de rango */}
 {!rangoValido && rango.desde && rango.hasta && (
 <div style={{background:"#ff3d5710",border:"1px solid #ff3d5730",borderRadius:4,padding:"10px 14px",fontSize:12,color:"#ff3d57"}}>
 ⚠ La fecha "Desde" debe ser anterior a "Hasta"
 </div>
 )}
 {/* Vista previa + contenido imprimible */}
 {vista && res && (
 <div className="fade-in">
 <div style={{height:1,background:"linear-gradient(to right,transparent,#a78bfa40,transparent)",marginBottom:16}} />
 {/* Contenido del reporte — este div es el que se imprime */}
 <div ref={printRef}>
 {/* Header del reporte */}
 <div className="rpt-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,paddingBottom:14,borderBottom:"2px solid #a78bfa40"}}>
 <div>
 <div style={{fontFamily:"Orbitron,monospace",fontSize:18,fontWeight:900,color:"#00d4ff",letterSpacing:3}}>NEXU<span style={{color:"#ff6b35"}}>STORE</span> <span style={{color:"#ff6b35"}}>RD</span></div>
 <div style={{fontSize:10,color:"#444",marginTop:4,letterSpacing:2}}>REPORTE FINANCIERO POR PERÍODO</div>
 <div style={{fontSize:10,color:"#333",marginTop:3}}>{new Date().toLocaleDateString("es-DO",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).toUpperCase()}</div>
 </div>
 <div style={{background:"#a78bfa15",border:"1px solid #a78bfa30",borderRadius:6,padding:"10px 16px",textAlign:"right"}}>
 <div style={{fontSize:9,color:"#555",letterSpacing:1}}>PERÍODO</div>
 <div style={{fontSize:14,fontWeight:900,color:"#a78bfa"}}>{rango.desde}</div>
 <div style={{fontSize:11,color:"#555"}}>al {rango.hasta}</div>
 </div>
 </div>
 {/* Tarjetas resumen */}
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
 {[
 {label:"INGRESOS", val:fmt(res.totalV), color:"#00e676", bg:"#00e67610", border:"#00e67630"},
 {label:"GASTOS", val:fmt(res.totalC), color:"#ff6b35", bg:"#ff6b3510", border:"#ff6b3530"},
 {label:"GANANCIA", val:fmt(res.ganancia), color:res.ganancia>=0?"#00d4ff":"#ff3d57", bg:res.ganancia>=0?"#00d4ff10":"#ff3d5710", border:res.ganancia>=0?"#00d4ff30":"#ff3d5730"},
 {label:"RENTAB.", val:`${res.rentab}%`, color:res.rentab>0?"#00e676":"#ff3d57", bg:"#00e67610", border:"#00e67630"},
 ].map(s=>(
 <div key={s.label} style={{background:s.bg,border:`1px solid ${s.border}`,borderLeft:`3px solid ${s.color}`,borderRadius:6,padding:"12px 14px",textAlign:"center"}}>
 <div style={{fontSize:15,fontWeight:900,color:s.color}}>{s.val}</div>
 <div style={{fontSize:8,color:"#333",marginTop:4,letterSpacing:1.5}}>{s.label}</div>
 </div>
 ))}
 </div>
 {/* Gráfico barras */}
 <div style={{background:"#0a0a0a",border:"1px solid #a78bfa20",borderRadius:6,padding:16,marginBottom:16}}>
 <div style={{fontFamily:"Orbitron,monospace",fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:10}}> VENTAS VS GASTOS POR MES</div>
 <div style={{display:"flex",gap:4,alignItems:"flex-end",height:100}}>
 {res.mesesData.map((m,i)=>{
 const hV=res.maxBar>0?(m.ventas/res.maxBar)*90:0;
 const hC=res.maxBar>0?(m.compras/res.maxBar)*90:0;
 const gan=m.ventas-m.compras;
 return (
 <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
 {(m.ventas>0||m.compras>0) && <div style={{fontSize:7,color:gan>=0?"#00e676":"#ff3d57",fontWeight:700}}>{gan>=0?"+":""}{Math.round(gan/1000)}K</div>}
 <div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:80}}>
 <div style={{flex:1,height:`${hV||1}px`,minHeight:m.ventas>0?2:0,background:m.ventas>0?"#00d4ff":"#1a1a1a",borderRadius:"1px 1px 0 0"}} />
 <div style={{flex:1,height:`${hC||1}px`,minHeight:m.compras>0?2:0,background:m.compras>0?"#ff6b35":"#1a1a1a",borderRadius:"1px 1px 0 0"}} />
 </div>
 <div style={{fontSize:7,color:"#333"}}>{m.mes}</div>
 </div>
 );
 })}
 </div>
 <div style={{display:"flex",gap:14,marginTop:8}}>
 <span style={{fontSize:9,color:"#00d4ff",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,background:"#00d4ff",borderRadius:1,display:"inline-block"}}/> Ventas</span>
 <span style={{fontSize:9,color:"#ff6b35",display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,background:"#ff6b35",borderRadius:1,display:"inline-block"}}/> Gastos</span>
 <span style={{fontSize:9,color:"#444",marginLeft:"auto"}}>Número = ganancia del mes en miles (K) DOP</span>
 </div>
 </div>
 {/* Ventas y Compras lado a lado */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
 <div style={{background:"#0a0a0a",border:"1px solid #00e67620",borderRadius:6,padding:12}}>
 <div style={{color:"#00e676",fontFamily:"Orbitron,monospace",fontSize:9,letterSpacing:1.5,marginBottom:10}}>▲ VENTAS ({res.ventas.length})</div>
 {res.ventas.length===0 && <div style={{color:"#333",fontSize:11,padding:"8px 0"}}>Sin ventas en este período</div>}
 {res.ventas.map(v=>(
 <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #ffffff06",fontSize:11}}>
 <div>
 <div style={{color:"#ccc",fontWeight:700}}>{v.cliente_nombre}</div>
 <div style={{color:"#333",fontSize:10}}>{v.codigo} · {v.fecha}</div>
 </div>
 <div style={{textAlign:"right"}}>
 <div style={{color:"#00e676",fontWeight:900}}>{fmt(v.total)}</div>
 <div style={{fontSize:9,color:v.estado==="Pagado"?"#00e676":"#ff3d57"}}>{v.estado}</div>
 </div>
 </div>
 ))}
 </div>
 <div style={{background:"#0a0a0a",border:"1px solid #ff6b3520",borderRadius:6,padding:12}}>
 <div style={{color:"#ff6b35",fontFamily:"Orbitron,monospace",fontSize:9,letterSpacing:1.5,marginBottom:10}}>▼ COMPRAS ({res.compras.length})</div>
 {res.compras.length===0 && <div style={{color:"#333",fontSize:11,padding:"8px 0"}}>Sin compras en este período</div>}
 {res.compras.map(c=>(
 <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #ffffff06",fontSize:11}}>
 <div>
 <div style={{color:"#ccc",fontWeight:700}}>{c.proveedor}</div>
 <div style={{color:"#333",fontSize:10}}>{c.codigo} · {c.fecha}</div>
 </div>
 <div style={{color:"#ff6b35",fontWeight:900}}>{fmt(c.total)}</div>
 </div>
 ))}
 </div>
 </div>
 {/* Margen por producto */}
 <div style={{background:"#0a0a0a",border:"1px solid #00d4ff20",borderRadius:6,padding:12,marginBottom:16}}>
 <div style={{fontFamily:"Orbitron,monospace",fontSize:9,color:"#00d4ff",letterSpacing:2,marginBottom:10}}>◈ MARGEN POR PRODUCTO — TOP 8</div>
 {res.topProds.map((p,i)=>{
 const color=p.mp>=60?"#00e676":p.mp>=30?"#ffd600":"#ff3d57";
 return (
 <div key={p.id} style={{marginBottom:10}}>
 <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
 <span style={{color:"#aaa"}}>{i+1}. {p.nombre} <span style={{color:"#444",fontSize:10}}>({p.categoria})</span></span>
 <div style={{display:"flex",gap:16,fontSize:11}}>
 <span style={{color:"#555"}}>Costo: <strong style={{color:"#ff6b35"}}>{fmt(p.precio_compra)}</strong></span>
 <span style={{color:"#555"}}>Venta: <strong style={{color:"#00e676"}}>{fmt(p.precio_venta)}</strong></span>
 <span style={{color:"#555"}}>Ganancia: <strong style={{color:"#00e676"}}>{fmt(p.precio_venta-p.precio_compra)}</strong></span>
 <span style={{fontWeight:900,color,fontSize:13}}>{p.mp.toFixed(1)}%</span>
 </div>
 </div>
 <div style={{background:"#111",borderRadius:2,height:4}}>
 <div style={{width:`${Math.min(100,p.mp)}%`,height:4,borderRadius:2,background:color,transition:"width .5s"}} />
 </div>
 </div>
 );
 })}
 </div>
 {/* Deudas pendientes */}
 {res.deudas.length>0 && (
 <div style={{background:"#ff3d5710",border:"1px solid #ff3d5730",borderRadius:6,padding:12,marginBottom:16}}>
 <div style={{color:"#ff3d57",fontFamily:"Orbitron,monospace",fontSize:9,letterSpacing:1.5,marginBottom:10}}>◆ DEUDAS PENDIENTES EN EL PERÍODO ({res.deudas.length}) — Total: {fmt(res.totalD)}</div>
 {res.deudas.map(d=>(
 <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #ffffff06",fontSize:11}}>
 <div>
 <span style={{color:"#ccc",fontWeight:700}}>{d.cliente_nombre}</span>
 <span style={{color:"#444",marginLeft:8,fontSize:10}}>{d.descripcion}</span>
 </div>
 <div style={{display:"flex",gap:16,fontSize:11}}>
 <span style={{color:"#555"}}>Total: <strong style={{color:"#ff3d57"}}>{fmt(d.monto)}</strong></span>
 <span style={{color:"#555"}}>Pagado: <strong style={{color:"#00e676"}}>{fmt(d.monto_pagado)}</strong></span>
 <span style={{color:"#555"}}>Pendiente: <strong style={{color:"#ffd600"}}>{fmt(d.monto-d.monto_pagado)}</strong></span>
 </div>
 </div>
 ))}
 </div>
 )}
 {/* Resumen final */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
 {[
 {label:"Total transacciones ventas", val:res.ventas.length},
 {label:"Total transacciones compras", val:res.compras.length},
 {label:"Ventas pendientes de cobro", val:fmt(res.ventas.filter(v=>v.estado==="Pendiente").reduce((s,v)=>s+v.total,0))},
 {label:"Deudas por cobrar", val:fmt(res.totalD)},
 {label:"Productos en inventario", val:data.productos.length},
 {label:"Clientes registrados", val:data.clientes.length},
 ].map(item=>(
 <div key={item.label} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#0a0a0a",borderRadius:4,fontSize:12}}>
 <span style={{color:"#444"}}>{item.label}</span>
 <span style={{color:"#e0e0e0",fontWeight:700}}>{item.val}</span>
 </div>
 ))}
 </div>
 {/* Footer */}
 <div style={{marginTop:18,paddingTop:12,borderTop:"1px solid #ffffff08",display:"flex",justifyContent:"space-between",fontSize:10,color:"#333"}}>
 <span>NexuStoreRD — Accesorios de PC | Santo Domingo, Rep. Dominicana</span>
 <span>Período: {rango.desde} al {rango.hasta}</span>
 </div>
 </div>{/* fin printRef */}
 {/* Botón imprimir al pie */}
 <button onClick={generarPDF} className="btn-glow"
 style={{width:"100%",marginTop:16,background:"#a78bfa20",color:"#a78bfa",border:"1px solid #a78bfa60",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1.5,padding:"13px 0"}}>
 DESCARGAR PDF
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
// ── DescuentoField — selector de descuento por monto $ o porcentaje % ────────
function DescuentoField({ subtotal, modo, monto, pct, color="#00d4ff", onModoChange, onMontoChange, onPctChange, fmt }) {
 const descuentoCalc = modo === "%" ? Math.round(subtotal * Math.min(100,Math.max(0,+pct||0)) / 100) : Math.min(+monto||0, subtotal);
 const totalCalc = subtotal - descuentoCalc;
 return (
 <div>
 <label style={{ fontSize:10, fontWeight:700, color:"#333", display:"block", marginBottom:6, letterSpacing:1.5, fontFamily:"Orbitron,monospace" }}>DESCUENTO</label>
 {/* Toggle $ / % */}
 <div style={{ display:"flex", gap:0, marginBottom:8, borderRadius:4, overflow:"hidden", border:"1px solid #1a1a1a", width:"fit-content" }}>
 {["$","%"].map(m=>(
 <button key={m} onClick={()=>onModoChange(m)}
 style={{ padding:"7px 18px", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, letterSpacing:1, border:"none", background: modo===m?`${color}30`:"#0a0a0a", color: modo===m?color:"#444", transition:"all .2s" }}>
 {m==="$"?"MONTO (DOP)":"PORCENTAJE (%)"}
 </button>
 ))}
 </div>
 {/* Input según modo */}
 <div style={{ position:"relative" }}>
 <input
 type="number" min="0" max={modo==="%"?100:undefined}
 value={modo==="%" ? pct : monto}
 onChange={e=>{ modo==="%" ? onPctChange(e.target.value) : onMontoChange(e.target.value); }}
 placeholder={modo==="%" ? "0 — 100" : "0"}
 style={{ width:"100%", padding:`10px ${modo==="%"?"34px":"14px"} 10px 14px`, border:`1px solid ${color}30`, borderRadius:4, fontSize:12, background:"#0a0a0a", color:"#e0e0e0", outline:"none", fontFamily:"inherit" }}
 />
 {modo==="%" && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color, fontSize:13, fontWeight:700, pointerEvents:"none" }}>%</span>}
 </div>
 {/* Preview en tiempo real */}
 {subtotal > 0 && descuentoCalc > 0 && (
 <div style={{ background:`${color}10`, border:`1px solid ${color}20`, borderRadius:4, padding:"8px 12px", marginTop:6, fontSize:11, display:"flex", justifyContent:"space-between" }}>
 <span style={{color:"#555"}}>
 {modo==="%"
 ? <span>Descuento <strong style={{color}}>{pct||0}%</strong> = <strong style={{color}}>{fmt(descuentoCalc)}</strong></span>
 : <span>Descuento <strong style={{color}}>{fmt(descuentoCalc)}</strong></span>
 }
 </span>
 <span style={{color:"#555"}}>Total: <strong style={{color}}>{fmt(totalCalc)}</strong></span>
 </div>
 )}
 </div>
 );
}
// ── EditVentaModal — componente con estado reactivo para monto pendiente ──
function EditVentaModal({ venta:v, data, fmt, today, nextId, onClose, onSave }) {
 const [estado, setEstado] = useState(v.estado);
 const [montoPendiente, setMontoPendiente] = useState(String(v.total));
 const pendienteMax = v.total;
 const montoPagado = Math.max(0, pendienteMax - (+montoPendiente||0));
 const handleSave = () => {
 const ventas = data.ventas.map(x => x.id===v.id ? {...x, estado} : x);
 let deudas = [...data.deudas];
 const deudaExistente = deudas.find(d => d.cliente_id===v.cliente_id && d.descripcion.includes(v.codigo));
 if (estado === "Pagado") {
 deudas = deudas.map(d =>
 d.cliente_id===v.cliente_id && d.descripcion.includes(v.codigo)
 ? {...d, estado:"Pagado", monto_pagado:d.monto} : d
 );
 } else if (estado === "Pendiente") {
 const pendiente = +montoPendiente||0;
 const pagado = Math.max(0, pendienteMax - pendiente);
 const nuevoEstado = pendiente <= 0 ? "Pagado" : pagado > 0 ? "Parcial" : "Pendiente";
 if (deudaExistente) {
 deudas = deudas.map(d =>
 d.cliente_id===v.cliente_id && d.descripcion.includes(v.codigo)
 ? {...d, monto:pendienteMax, monto_pagado:pagado, estado:nuevoEstado} : d
 );
 } else {
 deudas.push({
 id:nextId(deudas), cliente_id:v.cliente_id, cliente_nombre:v.cliente_nombre,
 descripcion:`${v.codigo} — ${v.items?.map(i=>i.nombre).join(", ")||""}`,
 monto:pendienteMax, monto_pagado:pagado,
 fecha_registro:today(), fecha_vencimiento:"", estado:nuevoEstado
 });
 }
 } else {
 // Anulado — no toca deudas
 }
 onSave(ventas, deudas);
 };
 return (
 <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}
 onClick={e=>e.target===e.currentTarget&&onClose()}>
 <div className="fade-in" style={{ background:"#080808", border:"1px solid #00e67630", borderRadius:8, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 0 60px #00e67620" }}>
 <div style={{ padding:"22px 28px", borderBottom:"1px solid #00e67620" }}>
 <h2 style={{ fontFamily:"Orbitron,monospace", fontSize:15, fontWeight:900, color:"#00e676", letterSpacing:2 }}>✏ EDITAR VENTA — {v.codigo}</h2>
 </div>
 <div style={{ padding:"22px 28px", display:"flex", flexDirection:"column", gap:14 }}>
 {/* Resumen venta */}
 <div style={{ background:"#00e67610", border:"1px solid #00e67630", borderRadius:6, padding:14, fontSize:12 }}>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{color:"#555"}}>Cliente:</span><strong style={{color:"#e0e0e0"}}>{v.cliente_nombre}</strong></div>
 <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{color:"#555"}}>Fecha:</span><span style={{color:"#aaa"}}>{v.fecha}</span></div>
 <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{color:"#555"}}>Total venta:</span><strong style={{color:"#00e676"}}>{fmt(v.total)}</strong></div>
 </div>
 {/* Selector estado */}
 <div>
 <label style={{ fontSize:10, fontWeight:700, color:"#333", display:"block", marginBottom:6, letterSpacing:1.5, fontFamily:"Orbitron,monospace" }}>ESTADO DE LA VENTA</label>
 <select value={estado} onChange={e=>{ setEstado(e.target.value); if(e.target.value==="Pendiente") setMontoPendiente(String(v.total)); }}
 style={{ width:"100%", padding:"10px 14px", border:"1px solid #1a1a1a", borderRadius:4, fontSize:12, background:"#0a0a0a", color:"#e0e0e0", outline:"none", cursor:"pointer", fontFamily:"inherit" }}>
 <option>Pagado</option>
 <option>Pendiente</option>
 <option>Anulado</option>
 </select>
 </div>
 {/* Casilla de monto pendiente — solo aparece si estado es Pendiente */}
 {estado === "Pendiente" && (
 <div style={{ background:"#ff3d5710", border:"1px solid #ff3d5730", borderRadius:6, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
 <div style={{ fontSize:11, color:"#ff3d57", letterSpacing:2, fontFamily:"Orbitron,monospace" }}>MONTO PENDIENTE DE PAGO</div>
 <div>
 <label style={{ fontSize:10, fontWeight:700, color:"#333", display:"block", marginBottom:6, letterSpacing:1.5, fontFamily:"Orbitron,monospace" }}>MONTO PENDIENTE (DOP) *</label>
 <div style={{ position:"relative" }}>
 <input
 type="number" min="0" max={pendienteMax}
 value={montoPendiente}
 onChange={e=>setMontoPendiente(e.target.value)}
 placeholder={`Máx: ${fmt(pendienteMax)}`}
 style={{ width:"100%", padding:"10px 14px", border:"1px solid #ff3d5740", borderRadius:4, fontSize:12, background:"#0a0a0a", color:"#ff3d57", outline:"none", fontFamily:"inherit" }}
 />
 </div>
 </div>
 {/* Desglose automático */}
 {montoPendiente !== "" && (
 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:4 }}>
 {[
 {label:"TOTAL VENTA", val:fmt(pendienteMax), color:"#aaa"},
 {label:"YA PAGADO", val:fmt(montoPagado), color:"#00e676"},
 {label:"PENDIENTE", val:fmt(+montoPendiente||0), color:"#ff3d57"},
 ].map(s=>(
 <div key={s.label} style={{ background:"#0a0a0a", borderRadius:4, padding:"8px 10px", textAlign:"center" }}>
 <div style={{ fontSize:13, fontWeight:900, color:s.color }}>{s.val}</div>
 <div style={{ fontSize:9, color:"#333", marginTop:3, letterSpacing:1.5 }}>{s.label}</div>
 </div>
 ))}
 </div>
 )}
 <div style={{ fontSize:10, color:"#ffd600", letterSpacing:.5 }}>
 ⚠ Este monto se actualizará automáticamente en el apartado de <strong>Deudas</strong>.
 </div>
 </div>
 )}
 {estado === "Pagado" && (
 <div style={{ background:"#00e67610", border:"1px solid #00e67630", borderRadius:4, padding:"9px 14px", fontSize:11, color:"#00e676" }}>
 ✓ La deuda vinculada a esta venta se marcará como <strong>Pagada</strong> automáticamente.
 </div>
 )}
 </div>
 <div style={{ padding:"16px 28px", borderTop:"1px solid #00e67615", display:"flex", gap:10, justifyContent:"flex-end" }}>
 <button className="btn-glow" onClick={onClose} style={{ background:"transparent", color:"#444", border:"1px solid #222", padding:"10px 20px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, letterSpacing:1 }}>CANCELAR</button>
 <button className="btn-glow" onClick={handleSave} style={{ background:"#00e67620", color:"#00e676", border:"1px solid #00e676", padding:"10px 24px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, letterSpacing:1.5, boxShadow:"0 0 15px #00e67630" }}>✓ GUARDAR CAMBIOS</button>
 </div>
 </div>
 </div>
 );
}
