const fs = require("fs");
const path = require("path");
const vm = require("vm");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
  }
}

const basePath = path.join(__dirname, "squatgym_vscode");

console.log("\n=======================================================");
console.log("       SQUATGYM - SUITE DE TESTS AUTOMATIZADOS         ");
console.log("=======================================================\n");

// -------------------------------------------------------------
// TEST SUITE 1: Verificación de Rutas y Navegación (nav.js)
// -------------------------------------------------------------
console.log("📦 SUITE 1: Verificación de Rutas (nav.js)");

const navPath = path.join(basePath, "nav.js");
const navSource = fs.readFileSync(navPath, "utf8");

// Extraer el objeto ROUTES de nav.js
const routesMatch = navSource.match(/const ROUTES = \{([\s\S]*?)\};/);
assert(routesMatch !== null, "ROUTES está definido en nav.js");

const routesBlock = routesMatch ? routesMatch[1] : "";
const routeLines = routesBlock.split("\n").filter((l) => l.includes(":"));
const routes = {};

routeLines.forEach((l) => {
  const parts = l.split(":");
  if (parts.length >= 2) {
    const key = parts[0].trim().replace(/['"]/g, "");
    const val = parts[1].trim().replace(/['",]/g, "");
    if (key && val) routes[key] = val;
  }
});

assert(routes.panelProfesor !== undefined, "Ruta 'panelProfesor' existe en ROUTES");
assert(routes.error !== undefined, "Ruta 'error' existe en ROUTES");
assert(routes.login === "screens/01_login.html", "Ruta 'login' apunta a 01_login.html");

// Verificar que todos los archivos destino de ROUTES existan en disco
for (const [routeKey, relPath] of Object.entries(routes)) {
  const fullPath = path.join(basePath, relPath);
  assert(fs.existsSync(fullPath), `Archivo destino para ruta '${routeKey}' (${relPath}) existe en disco`);
}

// Escanear todas las llamadas a SQ.go('...') en todo el código
function getAllFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(full, exts));
    } else if (exts.some((ext) => file.endsWith(ext))) {
      results.push(full);
    }
  });
  return results;
}

const htmlAndJsFiles = getAllFiles(basePath, [".html", ".js"]);
const referencedRoutes = new Set();

htmlAndJsFiles.forEach((f) => {
  const content = fs.readFileSync(f, "utf8");
  const matches = [...content.matchAll(/SQ\.go\(['"]([^'"]+)['"]\)/g)];
  matches.forEach((m) => referencedRoutes.add(m[1]));
});

for (const refRoute of referencedRoutes) {
  assert(routes[refRoute] !== undefined, `La ruta referenciada '${refRoute}' está registrada en nav.js`);
}

// -------------------------------------------------------------
// TEST SUITE 2: Integridad de classStore.js y Persistencia
// -------------------------------------------------------------
console.log("\n📦 SUITE 2: Pruebas Unitarias de classStore.js");

const classStorePath = path.join(basePath, "classStore.js");
const classStoreCode = fs.readFileSync(classStorePath, "utf8");

// Mock de localStorage y sessionStorage
const memoryStore = {};
const mockLocalStorage = {
  getItem: (k) => memoryStore[k] || null,
  setItem: (k, v) => { memoryStore[k] = String(v); },
  removeItem: (k) => { delete memoryStore[k]; },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); }
};

const mockWindow = {
  localStorage: mockLocalStorage,
  sessionStorage: mockLocalStorage,
  location: { pathname: "/squatgym_vscode/index.html" },
  document: {
    addEventListener: () => {},
    readyState: "complete"
  }
};

const context = vm.createContext({
  window: mockWindow,
  localStorage: mockLocalStorage,
  sessionStorage: mockLocalStorage,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Date: Date,
  JSON: JSON,
  Math: Math,
  Array: Array,
  Object: Object,
  Set: Set,
  console: console
});

try {
  vm.runInContext(classStoreCode, context);
  const store = context.window.SQClassStore;

  assert(store !== undefined, "SQClassStore se inicializó en window");

  const initialClasses = store.listClasses();
  assert(initialClasses.length >= 6, `Se inicializaron ${initialClasses.length} clases semilla`);

  // Verificar que todas las clases semilla tengan el atributo sala
  const allHaveSala = initialClasses.every((c) => c.sala && c.sala.length > 0);
  assert(allHaveSala, "Todas las clases semilla tienen asignada una 'sala'");

  const c1 = store.getClassById("c1");
  assert(c1 && c1.sala === "Salón CrossFit", "Clase 'c1' tiene sala 'Salón CrossFit'");

  // Test de creación de nueva clase con sala
  const nowStr = new Date().toISOString().slice(0, 10);
  const newClassRes = store.createClass({
    nombre: "Clase de Prueba",
    sedeId: "central",
    profesorId: "p1",
    sala: "Sala Test",
    fecha: "2026-11-01",
    horaInicio: "07:00",
    horaFin: "08:00",
    cupo: 10
  });

  assert(newClassRes.clase !== undefined, "createClass crea la clase exitosamente");
  assert(newClassRes.clase && newClassRes.clase.sala === "Sala Test", "createClass guarda correctamente el atributo 'sala'");

  // Test de detección de superposición
  const overlapRes = store.createClass({
    nombre: "Clase Solapada",
    sedeId: "central",
    profesorId: "p1",
    fecha: "2026-11-01",
    horaInicio: "07:30",
    horaFin: "08:30",
    cupo: 10
  });
  assert(overlapRes.error !== undefined, "Detección de superposición horaria previene colisiones");

  // Test de actualización de clase
  const updateRes = store.updateClass(newClassRes.clase.id, {
    sala: "Sala Test Actualizada",
    cupo: 12
  });
  assert(updateRes.clase.sala === "Sala Test Actualizada", "updateClass actualiza el atributo 'sala'");

  // Test de eliminación
  const deleteRes = store.deleteClass(newClassRes.clase.id);
  assert(deleteRes.clase && store.getClassById(newClassRes.clase.id) === undefined, "deleteClass elimina la clase correctamente");

  // Test de estudiantes y estado de habilitación
  const a1Status = store.getStudentStatus("a1");
  assert(a1Status.habilitado === true, "Alumno 'a1' (al día) figura habilitado");
  const a2Status = store.getStudentStatus("a2");
  assert(a2Status.habilitado === false && a2Status.motivo === "Deuda", "Alumno 'a2' (deudor) figura no habilitado por Deuda");

  // Test de ausencias frecuentes
  const ausencias = store.frequentAbsences(3);
  assert(ausencias.length > 0, "frequentAbsences retorna alumnos con 3 o más inasistencias");

} catch (err) {
  assert(false, `Error ejecutando classStore: ${err.message}`);
}

// -------------------------------------------------------------
// TEST SUITE 3: Validación de Formularios y Accesibilidad
// -------------------------------------------------------------
console.log("\n📦 SUITE 3: Validación de Formularios y Accesibilidad (WCAG)");

// 06_nuevo_usuario.html
const userFormPath = path.join(basePath, "screens/administrador/06_nuevo_usuario.html");
const userFormContent = fs.readFileSync(userFormPath, "utf8");

assert(userFormContent.includes('id="inputNombreCompleto"') && userFormContent.includes('for="inputNombreCompleto"'), "Campo 'Nombre Completo' tiene label[for] e input[id] vinculados");
assert(userFormContent.includes('id="inputDni"') && userFormContent.includes('for="inputDni"'), "Campo 'DNI' tiene label[for] e input[id] vinculados");
assert(userFormContent.includes('id="inputEmail"') && userFormContent.includes('for="inputEmail"'), "Campo 'Email' tiene label[for] e input[id] vinculados");
assert(userFormContent.includes('id="selectRol"') && userFormContent.includes('for="selectRol"'), "Campo 'Rol' tiene label[for] y select[id] vinculados");
assert(userFormContent.includes('id="newPwd"') && userFormContent.includes('for="newPwd"'), "Campo 'Contraseña' tiene label[for] e input[id] vinculados");
assert(userFormContent.includes('id="newPwdConfirm"') && userFormContent.includes('for="newPwdConfirm"'), "Campo 'Confirmar Contraseña' tiene label[for] e input[id] vinculados");
assert(userFormContent.includes("sq_custom_users"), "procesarCrearUsuario persiste los usuarios creados en localStorage");

// 00_error.html
const errorPagePath = path.join(basePath, "00_error.html");
const errorPageContent = fs.readFileSync(errorPagePath, "utf8");

const fontLinksCount = (errorPageContent.match(/family=Material\+Symbols\+Outlined/g) || []).length;
assert(fontLinksCount === 1, "00_error.html ya no tiene etiquetas link duplicadas para fuentes de iconos");
assert(errorPageContent.includes('href="screens/01_login.html"'), "Botón 'Volver al Inicio' en 00_error.html redirige a screens/01_login.html");
assert(errorPageContent.includes('<script src="nav.js"></script>'), "00_error.html incluye el script nav.js");

// 02_gestion_clases.html (secretaría)
const secreClasesPath = path.join(basePath, "screens/secretaria/02_gestion_clases.html");
const secreClasesContent = fs.readFileSync(secreClasesPath, "utf8");

assert(secreClasesContent.includes("prof?.nombre || 'Profesor no asignado'"), "02_gestion_clases.html maneja profesores nulos o inexistentes con fallback seguro");
assert(!secreClasesContent.includes("${c.sala}"), "02_gestion_clases.html evita mostrar 'undefined' cuando sala no está cargada");

// -------------------------------------------------------------
// RESUMEN FINAL
// -------------------------------------------------------------
console.log("\n=======================================================");
console.log(`TOTAL DE TESTS: ${totalTests}`);
console.log(`\x1b[32mTESTS EXITOSOS:  ${passedTests}\x1b[0m`);
if (failedTests > 0) {
  console.log(`\x1b[31mTESTS FALLIDOS:  ${failedTests}\x1b[0m`);
} else {
  console.log(`\x1b[32mTODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK)\x1b[0m`);
}
console.log("=======================================================\n");

process.exit(failedTests > 0 ? 1 : 0);
