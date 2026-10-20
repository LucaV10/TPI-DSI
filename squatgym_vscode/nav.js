(function () {
  'use strict';

  const ROUTES = {
    login: 'screens/01_login.html',
    error: '00_error.html',

    adminPanel: 'screens/administrador/01_panel.html',
    adminDashboard: 'screens/administrador/01_panel.html',
    adminUsuarios: 'screens/administrador/02_gestion_usuarios.html',
    adminNuevoUsuario: 'screens/administrador/06_nuevo_usuario.html',
    adminClases: 'screens/administrador/03_gestion_clases.html',
    adminFinanzas: 'screens/administrador/04_finanzas.html',
    adminAuditoria: 'screens/administrador/05_auditoria.html',

    alumnoPanel: 'screens/alumno/alumno_dashboard.html',
    alumnoCalendario: 'screens/alumno/alumno_asistencia.html',

    profesorPanel: 'screens/profesor/profesor_dashboard.html',
    profesorDashboard: 'screens/profesor/profesor_dashboard.html',
    panelProfesor: 'screens/profesor/profesor_dashboard.html',
    profesorCalendario: 'screens/profesor/02_calendario.html',
    profesorAsistencia: 'screens/profesor/profesor_asistencia.html',
    profesorHistorial: 'screens/profesor/profesor_historial.html',
    registroAsistencia: 'screens/profesor/profesor_asistencia.html',
    confirmacionAsistencia: 'screens/profesor/04_confirmacion_asistencia.html',

    secrePanel: 'screens/secretaria/01_panel.html',
    secreClases: 'screens/secretaria/02_gestion_clases.html',

    encargadoPanel: 'screens/encargado/01_panel.html',
    encargadoClases: 'screens/encargado/02_gestion_clases.html',
    encargadoNovedades: 'screens/encargado/03_novedades.html',
    encargadoProfes: 'screens/encargado/04_gestion_profes.html'
  };

  const STATE_KEY = 'sq_state';

  const getBasePrefix = () => {
    const path = (window.location.pathname || '').replace(/\\/g, '/');
    const screensIndex = path.indexOf('/screens/');
    if (screensIndex !== -1) {
      const suffix = path.substring(screensIndex + 9);
      const depth = suffix.split('/').length;
      return '../'.repeat(depth);
    }
    return '';
  };

  const loadState = () => {
    try {
      return JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    } catch (err) {
      return {};
    }
  };

  const saveState = (state) => {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state || {}));
  };

  const SQ = (window.SQ = window.SQ || {});
  SQ.state = loadState();

  SQ.setState = (next) => {
    const patch = next && typeof next === 'object' ? next : {};
    SQ.state = { ...SQ.state, ...patch };
    saveState(SQ.state);
  };

  SQ.go = (route, nextState) => {
    if (nextState) SQ.setState(nextState);

    const target = ROUTES[route] || route || ROUTES.login;
    const isAbsolute = /^(https?:|file:|\/|\.\.?\/)/.test(target);
    const href = isAbsolute ? target : `${getBasePrefix()}${target}`;

    window.location.href = href;
  };

  SQ.logout = () => {
    sessionStorage.removeItem(STATE_KEY);
    SQ.state = {};
    SQ.go('login');
  };

  SQ.fakeLoad = (ms) => new Promise((resolve) => setTimeout(resolve, ms || 600));

  SQ.toast = (message, type) => {
    const text = message || 'Info';
    const tone = type || 'info';

    let host = document.getElementById('sq-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sq-toast-host';
      host.style.position = 'fixed';
      host.style.bottom = '20px';
      host.style.right = '20px';
      host.style.display = 'flex';
      host.style.flexDirection = 'column';
      host.style.gap = '8px';
      host.style.zIndex = '9999';
      document.body.appendChild(host);
    }

    const toast = document.createElement('div');
    toast.textContent = text;
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '10px';
    toast.style.fontSize = '13px';
    toast.style.fontFamily = 'Lexend, system-ui, -apple-system, Segoe UI, sans-serif';
    toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    toast.style.background = tone === 'success' ? '#22c55e' : tone === 'error' ? '#ef4444' : tone === 'warning' ? '#f59e0b' : '#0ea5e9';
    toast.style.color = '#ffffff';

    host.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 200ms ease';
      setTimeout(() => toast.remove(), 220);
    }, 2200);
  };

  // --- Universal Notification Panel ---
  const loadClassStore = () => {
    return new Promise((resolve) => {
      if (typeof SQClassStore !== 'undefined') return resolve();
      const s = document.createElement('script');
      s.src = getBasePrefix() + 'classStore.js';
      s.onload = resolve;
      s.onerror = resolve; // Continue even if missing
      document.head.appendChild(s);
    });
  };

  SQ.initNotifs = async () => {
    // 1. Find the notification button (more robust selector)
    let btnIcon = Array.from(document.querySelectorAll('button span.material-symbols-outlined'))
      .find(el => el.textContent.trim() === 'notifications' || el.getAttribute('data-icon') === 'notifications');
    
    if (!btnIcon) {
      // Fallback: check by id
      const btnById = document.getElementById('btn-notif') || document.getElementById('notifBtn');
      if (btnById) {
        btnIcon = btnById.querySelector('span');
      }
    }
    
    if (!btnIcon) return; // No notification button on this page
    let btn = btnIcon.parentElement;

    // Remove inline onclick and clone to remove existing event listeners
    btn.removeAttribute('onclick');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    btn = newBtn;
    btn.id = 'sq-notif-btn';
    btn.style.position = 'relative';

    // Remove any hardcoded old panel
    const oldPanel = document.getElementById('notifPanel');
    if (oldPanel) oldPanel.remove();

    // 2. Load dependencies
    await loadClassStore();

    // 3. Create Badge
    let badge = btn.querySelector('.sq-notif-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'sq-notif-badge absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white';
      btn.appendChild(badge);
    }

    // 4. Create Panel
    let panel = document.getElementById('sq-notif-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'sq-notif-panel';
      // Styles for floating dropdown
      panel.className = 'fixed mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 w-80 sm:w-96 opacity-0 pointer-events-none transition-all duration-200 origin-top-right scale-95';
      panel.style.visibility = 'hidden';
      panel.style.top = '64px'; // typical header height
      panel.style.right = '16px';

      panel.innerHTML = `
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 class="font-bold text-slate-800 text-sm">Notificaciones</h3>
          <button id="sq-notif-read-all" class="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">Marcar como leídas</button>
        </div>
        <div id="sq-notif-list" class="max-h-[360px] overflow-y-auto">
        </div>
        <div class="p-2 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button class="w-full py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm" onclick="SQ.toast('Redirigiendo...', 'info')">
            Ir al Centro de Alertas
          </button>
        </div>
      `;
      document.body.appendChild(panel);
    }

    // 5. Populate List
    const listEl = document.getElementById('sq-notif-list');
    const role = SQ.state?.rol;
    let notifs = typeof SQClassStore !== 'undefined' ? SQClassStore.listNotifications(role) : [];

    // Fallback si no hay notificaciones, basado en el rol actual
    if (notifs.length === 0) {
      const currentPath = window.location.pathname.toLowerCase();
      const activeRole = role || (
        currentPath.includes('/administrador/') ? 'administrador' :
        currentPath.includes('/profesor/') ? 'profesor' :
        currentPath.includes('/secretaria/') ? 'secretaria' :
        currentPath.includes('/encargado/') ? 'encargado' :
        currentPath.includes('/alumno/') ? 'alumno' : 'alumno'
      );

      if (activeRole === 'administrador') {
        notifs = [
          { type: 'warning', title: 'Alerta de Seguridad', body: 'Acceso fallido detectado en Torniquete B-1.', time: 'Hace 10 min' },
          { type: 'success', title: 'Reporte Generado', body: 'El balance semanal de ingresos está listo.', time: 'Hace 2 hs' },
          { type: 'info', title: 'Respaldo del Sistema', body: 'La copia de seguridad diaria se completó con éxito.', time: 'Hace 1 día' }
        ];
      } else if (activeRole === 'profesor') {
        notifs = [
          { type: 'warning', title: 'Suplencia Requerida', body: 'Se solicita profesor para Yoga Flow hoy a las 18:00 hs.', time: 'Hace 1 hora' },
          { type: 'success', title: 'Planilla Guardada', body: 'Se ha guardado exitosamente la asistencia de CrossFit Avanzado.', time: 'Hace 2 hs' },
          { type: 'info', title: 'Capacitación Docente', body: 'Nueva capacitación en primeros auxilios disponible en el portal.', time: 'Hace 1 día' }
        ];
      } else if (activeRole === 'secretaria') {
        notifs = [
          { type: 'warning', title: 'Inasistencias Frecuentes', body: 'Laura Gómez registra 3 inasistencias consecutivas.', time: 'Hace 30 min' },
          { type: 'success', title: 'Nueva Inscripción', body: 'Se ha registrado un nuevo socio: Fernando Vera.', time: 'Hace 2 hs' },
          { type: 'success', title: 'Pago Recibido', body: 'El alumno Lionel Messi abonó su cuota mensual de Pase Libre.', time: 'Hace 4 hs' }
        ];
      } else if (activeRole === 'encargado') {
        notifs = [
          { type: 'warning', title: 'Reemplazo Solicitado', body: 'El Profesor Carlos Mendoza solicita un reemplazo urgente.', time: 'Hace 15 min' },
          { type: 'warning', title: 'Stock Crítico', body: 'Proteína Whey Isolate baja de stock (2 unidades).', time: 'Hace 30 min' },
          { type: 'info', title: 'Reporte de Mantenimiento', body: 'Caminadora número 3 fuera de servicio en Sede Central.', time: 'Hace 4 hs' }
        ];
      } else {
        // Alumnos o por defecto
        notifs = [
          { type: 'warning', title: 'Clase Suspendida', body: 'Tu clase de Yoga Flow (10:00 hs) ha sido cancelada.', time: 'Hace 1 hora' },
          { type: 'success', title: 'Asistencia Registrada', body: 'Se registró tu ingreso al sector Musculación.', time: 'Hace 2 horas' },
          { type: 'info', title: 'Vencimiento Próximo', body: 'Tu cuota de Pase Libre vence en 3 días.', time: 'Hace 1 día' }
        ];
      }
    }

    const timeSince = (iso) => {
      if (!iso || !iso.includes('T')) return iso;
      const ms = Date.now() - new Date(iso).getTime();
      const min = Math.floor(ms / 60000);
      if (min < 60) return `Hace ${min} min`;
      const hrs = Math.floor(min / 60);
      if (hrs < 24) return `Hace ${hrs} hs`;
      return `Hace ${Math.floor(hrs / 24)} días`;
    };

    const getAvatarForNotification = (n) => {
      const type = n.type || 'info';
      const title = (n.title || n.mensaje || '').toLowerCase();
      const body = (n.body || n.message || '').toLowerCase();
      const fullText = `${title} ${body}`;

      // 1. Detect person names in the notification message/body/title
      if (fullText.includes('carlos mendoza') || fullText.includes('prof. c. mendoza')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKU1h_U2QTe39h6rsJ-JMzJf5asFhcWdzJfJ6DtGvnvTZZbzKZOk9pd_k5Iaos--UUxFtLfm8Sax30i5wTQNqcVRMgid4mW7Oy1ZyokyTKnys5axE17nuOzEbwU8ofAUL_L-FG6Rjm0J5DrGMD9-yVVIABsAZCPLTR6amKkQ3awqYyYVBb3wepQ7EqjIUV4UtoG3-H9D9mRZ7EJwh9-U2RT-vv_3ETjj3ly1i1w43OaBtJWkMDl1KxyHIPYH2hNL6dmStphN_veXc';
      }
      if (fullText.includes('laura gomez') || fullText.includes('laura g.')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAShiNGWOFBEfFvN5Lx-_x0vbjYU7sHB_8Zx5_nujZk0sWjs7tRstGTKh3hXVDQLpx1j0ipGUG2ST-n4jy4q5a4_yJJHRQBlUQF0TQBv7YtqPiTRIxSwbJyyaZtBwlI1MUpXbFigZuBIEJpFNxxzMY-Tt6wdVPC_ZNzOqFeQNVr12ycm-RAes75WQttSkuln5aVRgHZiECNuZiYz5RO-H6rqBIfQUXa8ux6ThJM22Bf-gliKcGJxlBhWQERaqDmfxbewcBqoOxyPbnS';
      }
      if (fullText.includes('laura sanchez') || fullText.includes('laura s.')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAShiNGWOFBEfFvN5Lx-_x0vbjYU7sHB_8Zx5_nujZk0sWjs7tRstGTKh3hXVDQLpx1j0ipGUG2ST-n4jy4q5a4_yJJHRQBlUQF0TQBv7YtqPiTRIxSwbJyyaZtBwlI1MUpXbFigZuBIEJpFNxxzMY-Tt6wdVPC_ZNzOqFeQNVr12ycm-RAes75WQttSkuln5aVRgHZiECNuZiYz5RO-H6rqBIfQUXa8ux6ThJM22Bf-gliKcGJxlBhWQERaqDmfxbewcBqoOxyPbnS';
      }
      if (fullText.includes('lionel messi') || fullText.includes('messi')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp8YXJg0eWdtQmkvniAA-zqVXdolTOZnmVa9k89AEC75hIzpFD597h6p3JTaDQRHipOvrmqTDiPVOIetuUHfK25jwK1CVV025iX_scT0JJj28PkDKwLyX8dnMTbVqNgOPAAKjCjrQEVYr7ZYfBj4elxAeZVj2c3kOJKQWsFGsQk8xYGqC155mYyQ5yA2RxaHMW0H884bZpBkLxtXnEQF_gHpnW3SjvWBbr_M7SakKvReTuf4TX6Ug4ZwEQFJYL_GXbb4lA7A6aXWUV';
      }
      if (fullText.includes('fernando vera') || fullText.includes('fernando')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi-suDxOAwNFw-77AdPIVyOfgOFhttbYHcAa8qhpgNl2UwF9Q8FPqd0Ldq9-ynbtTZP6XFKTJUnqau_FsRkMc7v2W9gE1DbQ0Rbm1ptl-WcEh59vkHbdrLNSIGUxBK5JrEDZ9AsrQ4aITbkAj-RjMhIypPHlZzgjQbXD_cA-zGO46htR6NPMT0ZqjPh52_ogiq6wLEojD8a7gVvnhbxa-Os1yF_ard7ef5U_BVM0zG2khDk2UlBnAlGdO5_KYTMqCpjdpBUaQivFiO';
      }
      if (fullText.includes('martin rodriguez') || fullText.includes('martin r.')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAi4I11kTLsVXWTHvGk9ehEfoxjFC3l2Jl0mIDVY_ZbEyoHm-4F70YCB01VO0H-QGEuAq77-J_EgNrlSuySKt3DxYeBmEpK2Ec-E9jAr99gI1xnxOuXbv8SKDbF9zXOnuDWhCKpJEAHw_ftOyi2ShNoldVNeGZxeNLo4Fg_EShe1plX6l09hihbPPwRE_TzmIJx3UTNSDjiDC8UusIUGdA56jAjnjT0jw3dqRak9aUa7StxmYnxyLxssy-GSpwTfIjquwaTiIVsQUW';
      }
      if (fullText.includes('lucia mendez') || fullText.includes('lucía mendez')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAi4I11kTLsVXWTHvGk9ehEfoxjFC3l2Jl0mIDVY_ZbEyoHm-4F70YCB01VO0H-QGEuAq77-J_EgNrlSuySKt3DxYeBmEpK2Ec-E9jAr99gI1xnxOuXbv8SKDbF9zXOnuDWhCKpJEAHw_ftOyi2ShNoldVNeGZxeNLo4Fg_EShe1plX6l09hihbPPwRE_TzmIJx3UTNSDjiDC8UusIUGdA56jAjnjT0jw3dqRak9aUa7StxmYnxyLxssy-GSpwTfIjquwaTiIVsQUW';
      }
      if (fullText.includes('elena pastor') || fullText.includes('elena p.')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAShiNGWOFBEfFvN5Lx-_x0vbjYU7sHB_8Zx5_nujZk0sWjs7tRstGTKh3hXVDQLpx1j0ipGUG2ST-n4jy4q5a4_yJJHRQBlUQF0TQBv7YtqPiTRIxSwbJyyaZtBwlI1MUpXbFigZuBIEJpFNxxzMY-Tt6wdVPC_ZNzOqFeQNVr12ycm-RAes75WQttSkuln5aVRgHZiECNuZiYz5RO-H6rqBIfQUXa8ux6ThJM22Bf-gliKcGJxlBhWQERaqDmfxbewcBqoOxyPbnS';
      }
      if (fullText.includes('juan gomez') || fullText.includes('juan g.')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAShiNGWOFBEfFvN5Lx-_x0vbjYU7sHB_8Zx5_nujZk0sWjs7tRstGTKh3hXVDQLpx1j0ipGUG2ST-n4jy4q5a4_yJJHRQBlUQF0TQBv7YtqPiTRIxSwbJyyaZtBwlI1MUpXbFigZuBIEJpFNxxzMY-Tt6wdVPC_ZNzOqFeQNVr12ycm-RAes75WQttSkuln5aVRgHZiECNuZiYz5RO-H6rqBIfQUXa8ux6ThJM22Bf-gliKcGJxlBhWQERaqDmfxbewcBqoOxyPbnS';
      }

      // 2. Specific activity avatars (CrossFit, Yoga)
      if (fullText.includes('yoga') || fullText.includes('pilates')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAShiNGWOFBEfFvN5Lx-_x0vbjYU7sHB_8Zx5_nujZk0sWjs7tRstGTKh3hXVDQLpx1j0ipGUG2ST-n4jy4q5a4_yJJHRQBlUQF0TQBv7YtqPiTRIxSwbJyyaZtBwlI1MUpXbFigZuBIEJpFNxxzMY-Tt6wdVPC_ZNzOqFeQNVr12ycm-RAes75WQttSkuln5aVRgHZiECNuZiYz5RO-H6rqBIfQUXa8ux6ThJM22Bf-gliKcGJxlBhWQERaqDmfxbewcBqoOxyPbnS';
      }
      if (fullText.includes('crossfit') || fullText.includes('musculación') || fullText.includes('funcional')) {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKU1h_U2QTe39h6rsJ-JMzJf5asFhcWdzJfJ6DtGvnvTZZbzKZOk9pd_k5Iaos--UUxFtLfm8Sax30i5wTQNqcVRMgid4mW7Oy1ZyokyTKnys5axE17nuOzEbwU8ofAUL_L-FG6Rjm0J5DrGMD9-yVVIABsAZCPLTR6amKkQ3awqYyYVBb3wepQ7EqjIUV4UtoG3-H9D9mRZ7EJwh9-U2RT-vv_3ETjj3ly1i1w43OaBtJWkMDl1KxyHIPYH2hNL6dmStphN_veXc';
      }

      // 3. Fallbacks based on category / type
      if (type === 'reemplazo_solicitado') {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKU1h_U2QTe39h6rsJ-JMzJf5asFhcWdzJfJ6DtGvnvTZZbzKZOk9pd_k5Iaos--UUxFtLfm8Sax30i5wTQNqcVRMgid4mW7Oy1ZyokyTKnys5axE17nuOzEbwU8ofAUL_L-FG6Rjm0J5DrGMD9-yVVIABsAZCPLTR6amKkQ3awqYyYVBb3wepQ7EqjIUV4UtoG3-H9D9mRZ7EJwh9-U2RT-vv_3ETjj3ly1i1w43OaBtJWkMDl1KxyHIPYH2hNL6dmStphN_veXc';
      }
      if (type === 'aviso_clase' || type === 'nota_clase') {
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp8YXJg0eWdtQmkvniAA-zqVXdolTOZnmVa9k89AEC75hIzpFD597h6p3JTaDQRHipOvrmqTDiPVOIetuUHfK25jwK1CVV025iX_scT0JJj28PkDKwLyX8dnMTbVqNgOPAAKjCjrQEVYr7ZYfBj4elxAeZVj2c3kOJKQWsFGsQk8xYGqC155mYyQ5yA2RxaHMW0H884bZpBkLxtXnEQF_gHpnW3SjvWBbr_M7SakKvReTuf4TX6Ug4ZwEQFJYL_GXbb4lA7A6aXWUV';
      }
      
      // Default: Security / system admin avatar
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Rh2JhAVdM20WSCRWycTPR8xyV6vmE2FDGVWweRmIVHkaUXYIkRWTnlRAmDnQAbBYwwo9RDJqTLkUs1k9y-xXOeJjg9fk17uv0vknZCENInxb5iiAJpUCivk5V_VKL12SMsK2sKZl3ib6VdULcTbhBJ5JRim4Vn7HtdjYlj55FyH41pMEaKgI0nhO_iVfM5dUZfWciLO6zKYGiLOB0t-b8n3iQ9luRdbkuEuuO2Y2oQVRg1lvpUA30WdrXLWyeJ8_eu0QFeEdZBk';
    };

    const mapNotification = (n) => {
      const type = n.type || 'info';
      let title = n.title || n.mensaje;
      let body = n.body || n.message || '';
      const time = n.fecha || n.time || new Date().toISOString();

      if (!title) {
        if (type === 'reemplazo_solicitado') {
          title = 'Reemplazo Solicitado';
        } else if (type === 'aviso_clase') {
          title = 'Aviso de Clase';
        } else if (type === 'nota_clase') {
          title = 'Nota de Clase';
        } else if (type === 'inasistencias') {
          title = 'Inasistencias Frecuentes';
        } else {
          title = body || 'Notificación';
          if (title === body) body = '';
        }
      }

      return { type, title, body, time };
    };

    listEl.innerHTML = notifs.map(n => {
      const mapped = mapNotification(n);
      const avatar = getAvatarForNotification(n);
      const isWarn = mapped.type === 'warning' || mapped.type === 'error' || mapped.type === 'inasistencias' || mapped.type === 'reemplazo_solicitado';
      const isSucc = mapped.type === 'success' || mapped.type === 'nota_clase';
      const color = isWarn ? 'red' : isSucc ? 'green' : 'blue';

      let icon = 'info';
      if (mapped.type === 'warning' || mapped.type === 'error' || mapped.type === 'inasistencias') {
        icon = 'warning';
      } else if (mapped.type === 'reemplazo_solicitado') {
        icon = 'swap_horiz';
      } else if (mapped.type === 'success') {
        icon = 'check_circle';
      } else if (mapped.type === 'nota_clase') {
        icon = 'edit_note';
      } else if (mapped.type === 'aviso_clase') {
        icon = 'campaign';
      }

      return `
      <a href="#" class="block p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors relative">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-${color}-500"></div>
        <div class="flex gap-3.5 items-start">
          <div class="relative shrink-0 mt-1">
            <img src="${avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" alt="Avatar">
            <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-${color}-500 border-2 border-white flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-[11px] font-bold" style="font-variation-settings: 'FILL' 1;">${icon}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-slate-800 font-bold mb-0.5">${mapped.title}</p>
            ${mapped.body ? `<p class="text-xs text-slate-500 leading-snug font-medium">${mapped.body}</p>` : ''}
            <p class="text-[10px] text-slate-400 mt-1.5 font-bold tracking-tight">${timeSince(mapped.time)}</p>
          </div>
        </div>
      </a>
    `}).join('');

    // 6. Events
    const closeNotif = () => {
      if (panel.style.visibility === 'visible') {
        panel.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        panel.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        setTimeout(() => panel.style.visibility = 'hidden', 200);
      }
    };

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = panel.style.visibility === 'hidden';
      if (isHidden) {
        panel.style.visibility = 'visible';
        panel.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        panel.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
      } else {
        closeNotif();
      }
    });

    document.getElementById('sq-notif-read-all').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (badge) badge.style.display = 'none';
      closeNotif();
      SQ.toast('Todas las notificaciones marcadas como leídas', 'success');
    });

    document.addEventListener('click', (e) => {
      if (panel.style.visibility === 'visible' && !panel.contains(e.target) && !btn.contains(e.target)) {
        closeNotif();
      }
    });

    // Press Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNotif();
    });
  };

  // Run automatically when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SQ.initNotifs);
  } else {
    SQ.initNotifs();
  }

})();
