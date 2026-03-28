/* ============================================================
   DIAMOND BOUTIQUE — App (Login + Caja)
   ============================================================ */

const App = (() => {
  let rol = null;          // 'admin' | 'empleado'
  let empleados = [];
  let empleadoActual = '';

  // ─── UTILIDADES ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const money = (n) => '$' + Number(n || 0).toLocaleString('es-CO');
  const show = (el) => el.classList.remove('hidden');
  const hide = (el) => el.classList.add('hidden');

  function toast(msg, tipo = 'success') {
    const t = document.createElement('div');
    t.className = 'toast toast-' + tipo;
    t.textContent = msg;
    $('#toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  // ─── MODAL ───
  function openModal(titulo, bodyHTML, footerHTML) {
    $('#modal-title').textContent = titulo;
    $('#modal-body').innerHTML = bodyHTML;
    $('#modal-footer').innerHTML = footerHTML || '';
    show($('#modal-overlay'));
  }
  function closeModal() { hide($('#modal-overlay')); }

  // ─── LOGIN ───
  async function initLogin() {
    $('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const clave = $('#login-clave').value.trim();
      if (!clave) return;

      const btn = $('#login-btn');
      btn.disabled = true;
      hide($('#login-error'));

      try {
        const [claves, empData] = await Promise.all([
          API.obtenerClaves(),
          API.obtenerEmpleados()
        ]);

        empleados = empData.empleados || [];

        if (clave === claves.claveAdmin) {
          rol = 'admin';
        } else if (clave === claves.claveEmpleados) {
          rol = 'empleado';
        } else {
          show($('#login-error'));
          $('#login-error').textContent = 'Clave incorrecta';
          btn.disabled = false;
          return;
        }

        // Mostrar selector de empleado
        mostrarSelectorEmpleado();

      } catch (err) {
        show($('#login-error'));
        $('#login-error').textContent = 'Error conectando al servidor';
        btn.disabled = false;
      }
    });
  }

  function mostrarSelectorEmpleado() {
    const opciones = empleados.map(e =>
      `<option value="${e.nombre}">${e.nombre} — ${e.cargo}</option>`
    ).join('');

    openModal('Selecciona tu nombre', `
      <div class="form-group">
        <label>Empleado</label>
        <select id="sel-empleado">${opciones}</select>
      </div>
    `, `
      <button class="btn btn-primary" id="btn-confirmar-empleado">Continuar</button>
    `);

    document.getElementById('btn-confirmar-empleado').addEventListener('click', () => {
      empleadoActual = document.getElementById('sel-empleado').value;
      closeModal();
      entrarApp();
    });
  }

  function entrarApp() {
    hide($('#login-screen'));
    $('#login-screen').classList.remove('active');
    show($('#app-screen'));
    $('#app-screen').classList.add('active');

    // Rol badge
    const badge = $('#user-role-badge');
    badge.textContent = rol === 'admin' ? 'Admin' : 'Empleado';
    badge.className = 'role-badge ' + (rol === 'admin' ? 'admin' : 'empleado');
    $('#user-name-display').textContent = empleadoActual;

    // Mostrar opciones admin
    if (rol === 'admin') {
      $$('.admin-only').forEach(el => show(el));
    }

    // Fecha
    $('#current-date').textContent = new Date().toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    // Cargar sección inicial
    navigateTo('caja');
  }

  // ─── NAVEGACIÓN ───
  function initNav() {
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        navigateTo(section);
        // Cerrar sidebar en móvil
        $('#sidebar').classList.remove('open');
      });
    });

    $('#menu-toggle').addEventListener('click', () => {
      $('#sidebar').classList.toggle('open');
    });
    $('#sidebar-close').addEventListener('click', () => {
      $('#sidebar').classList.remove('open');
    });
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    $('#logout-btn').addEventListener('click', () => {
      location.reload();
    });
  }

  function navigateTo(section) {
    // Actualizar nav activa
    $$('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Mostrar sección
    $$('.content-section').forEach(s => { s.classList.remove('active'); hide(s); });
    const sec = $(`#sec-${section}`);
    if (sec) { show(sec); sec.classList.add('active'); }

    // Título
    const titles = {
      dashboard: 'Dashboard', trajes: 'Trajes', accesorios: 'Accesorios',
      alquileres: 'Alquileres', pagos: 'Pagos', caja: 'Caja',
      gastos: 'Gastos', asistencia: 'Asistencia'
    };
    $('#section-title').textContent = titles[section] || section;

    // Cargar datos de la sección
    if (section === 'caja') cargarCaja();
    if (section === 'dashboard') cargarDashboard();
  }

  // ─── DASHBOARD (básico) ───
  async function cargarDashboard() {
    try {
      const d = await API.obtenerDashboard();
      $('#d-ventas-hoy').textContent = money(d.ventasHoy);
      $('#d-ventas-semana').textContent = money(d.ventasSemana);
      $('#d-ventas-mes').textContent = money(d.ventasMes);
      $('#d-ventas-anio').textContent = money(d.ventasAnio);
      $('#d-saldo-caja').textContent = money(d.saldoCaja);
      $('#d-pendiente').textContent = money(d.pendienteCobrar);
      $('#d-cant-pendiente').textContent = (d.cantPendiente || 0) + ' alquileres';
      $('#d-disponibles').textContent = d.disponibles || 0;
      $('#d-total-trajes').textContent = d.totalTrajes || 0;
      $('#d-vencidos').textContent = d.vencidos || 0;
      $('#d-entrega-hoy').textContent = d.entregaHoy || 0;
      $('#d-efectivo-hoy').textContent = money(d.efectivoHoy);
      $('#d-salidas-hoy').textContent = money(d.salidasHoy);
      $('#d-gastos-mes').textContent = money(d.gastosMes);
      $('#d-saldo-neto').textContent = money(d.saldoNeto);
      $('#d-alquilados').textContent = d.alquilados || 0;

      // Medios de pago
      const medios = d.porMedioPago || {};
      const mediosHTML = Object.entries(medios).map(([nombre, valor]) =>
        `<div class="medio-pago-item">
          <span class="mp-nombre">${nombre}</span>
          <span class="mp-valor">${money(valor)}</span>
        </div>`
      ).join('');
      $('#d-medios-pago').innerHTML = mediosHTML || '<span class="text-muted">Sin datos</span>';
    } catch (err) {
      toast('Error cargando dashboard', 'error');
    }
  }

  // ─── CAJA ───
  async function cargarCaja() {
    try {
      const estado = await API.estadoCaja();

      // Indicador
      const ind = $('#caja-indicator');
      ind.className = 'caja-indicator ' + (estado.abierta ? 'open' : 'closed');
      $('#caja-status-text').textContent = estado.abierta
        ? 'Caja abierta desde las ' + (estado.hora || '--:--')
        : (estado.ultimoMovimiento === 'Cierre'
          ? 'Caja cerrada'
          : 'Sin apertura hoy');

      $('#caja-saldo-valor').textContent = money(estado.saldoActual);

      // Habilitar/deshabilitar botones según estado
      const btnApertura = $('#btn-apertura-caja');
      const btnSalida = $('#btn-salida-caja');
      const btnCierre = $('#btn-cierre-caja');

      if (estado.abierta) {
        btnApertura.disabled = true;
        btnSalida.disabled = false;
        btnCierre.disabled = false;
      } else {
        btnApertura.disabled = false;
        btnSalida.disabled = true;
        btnCierre.disabled = true;
      }
    } catch (err) {
      toast('Error consultando estado de caja', 'error');
    }
  }

  function billetesFormHTML() {
    return `
      <div class="billetes-grid">
        <div class="billete-item">
          <label>$100.000</label>
          <input type="number" id="b100" min="0" value="0" data-valor="100000">
        </div>
        <div class="billete-item">
          <label>$50.000</label>
          <input type="number" id="b50" min="0" value="0" data-valor="50000">
        </div>
        <div class="billete-item">
          <label>$20.000</label>
          <input type="number" id="b20" min="0" value="0" data-valor="20000">
        </div>
        <div class="billete-item">
          <label>$10.000</label>
          <input type="number" id="b10" min="0" value="0" data-valor="10000">
        </div>
        <div class="billete-item">
          <label>$5.000</label>
          <input type="number" id="b5" min="0" value="0" data-valor="5000">
        </div>
        <div class="billete-item">
          <label>$2.000</label>
          <input type="number" id="b2" min="0" value="0" data-valor="2000">
        </div>
        <div class="billete-item">
          <label>$1.000</label>
          <input type="number" id="b1" min="0" value="0" data-valor="1000">
        </div>
        <div class="billete-item">
          <label>$500</label>
          <input type="number" id="m500" min="0" value="0" data-valor="500">
        </div>
        <div class="billete-item">
          <label>$200</label>
          <input type="number" id="m200" min="0" value="0" data-valor="200">
        </div>
        <div class="billete-item">
          <label>$100</label>
          <input type="number" id="m100" min="0" value="0" data-valor="100">
        </div>
      </div>
      <div class="billete-total" id="billete-total">Total: $0</div>
    `;
  }

  function activarCalculoBilletes() {
    const inputs = document.querySelectorAll('.billetes-grid input');
    inputs.forEach(inp => {
      inp.addEventListener('input', () => {
        let total = 0;
        inputs.forEach(i => {
          total += (parseInt(i.value) || 0) * parseInt(i.dataset.valor);
        });
        document.getElementById('billete-total').textContent = 'Total: ' + money(total);
      });
    });
  }

  function obtenerDatosBilletes() {
    return {
      b100: document.getElementById('b100').value,
      b50:  document.getElementById('b50').value,
      b20:  document.getElementById('b20').value,
      b10:  document.getElementById('b10').value,
      b5:   document.getElementById('b5').value,
      b2:   document.getElementById('b2').value,
      b1:   document.getElementById('b1').value,
      m500: document.getElementById('m500').value,
      m200: document.getElementById('m200').value,
      m100: document.getElementById('m100').value,
    };
  }

  // Apertura
  function modalApertura() {
    openModal('Apertura de Caja', `
      <p style="color: var(--text-secondary); margin-bottom: 10px;">
        Cuenta el efectivo que hay en caja para iniciar el día.
      </p>
      ${billetesFormHTML()}
      <div class="form-group">
        <label>Nota (opcional)</label>
        <input type="text" id="caja-nota" placeholder="Ej: Apertura del día">
      </div>
    `, `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-success" id="btn-confirmar-apertura">Abrir Caja</button>
    `);

    activarCalculoBilletes();

    document.getElementById('btn-confirmar-apertura').addEventListener('click', async () => {
      const btn = document.getElementById('btn-confirmar-apertura');
      btn.disabled = true;
      btn.textContent = 'Registrando...';

      try {
        const datos = {
          ...obtenerDatosBilletes(),
          tipo: 'Apertura',
          responsable: empleadoActual,
          nota: document.getElementById('caja-nota').value || 'Apertura del día'
        };

        const res = await API.registrarCaja(datos);
        if (res.ok) {
          toast('Caja abierta — ' + money(res.total));
          closeModal();
          cargarCaja();
        } else {
          toast('Error al abrir caja', 'error');
          btn.disabled = false;
          btn.textContent = 'Abrir Caja';
        }
      } catch (err) {
        toast('Error de conexión', 'error');
        btn.disabled = false;
        btn.textContent = 'Abrir Caja';
      }
    });
  }

  // Cierre
  function modalCierre() {
    openModal('Cierre de Caja', `
      <p style="color: var(--text-secondary); margin-bottom: 10px;">
        Cuenta todo el efectivo en caja para cerrar el día.
      </p>
      ${billetesFormHTML()}
      <div class="form-group">
        <label>Nota (opcional)</label>
        <input type="text" id="caja-nota" placeholder="Ej: Sin novedad">
      </div>
    `, `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-danger" id="btn-confirmar-cierre">Cerrar Caja</button>
    `);

    activarCalculoBilletes();

    document.getElementById('btn-confirmar-cierre').addEventListener('click', async () => {
      const btn = document.getElementById('btn-confirmar-cierre');
      btn.disabled = true;
      btn.textContent = 'Cerrando...';

      try {
        const datos = {
          ...obtenerDatosBilletes(),
          tipo: 'Cierre',
          responsable: empleadoActual,
          nota: document.getElementById('caja-nota').value || 'Cierre del día'
        };

        const res = await API.registrarCaja(datos);
        if (res.ok) {
          toast('Caja cerrada — ' + money(res.total));
          closeModal();
          cargarCaja();
        } else {
          toast('Error al cerrar caja', 'error');
          btn.disabled = false;
          btn.textContent = 'Cerrar Caja';
        }
      } catch (err) {
        toast('Error de conexión', 'error');
        btn.disabled = false;
        btn.textContent = 'Cerrar Caja';
      }
    });
  }

  // Salida de caja
  function modalSalida() {
    openModal('Salida de Caja', `
      <p style="color: var(--text-secondary); margin-bottom: 10px;">
        Registra dinero que sale de la caja (domicilios, compras, etc).
      </p>
      ${billetesFormHTML()}
      <div class="form-group">
        <label>Concepto de la salida *</label>
        <input type="text" id="caja-concepto" placeholder="Ej: Domicilio traje" required>
      </div>
      <div class="form-group">
        <label>Nota (opcional)</label>
        <input type="text" id="caja-nota" placeholder="Detalle adicional">
      </div>
    `, `
      <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
      <button class="btn btn-warning" id="btn-confirmar-salida">Registrar Salida</button>
    `);

    activarCalculoBilletes();

    document.getElementById('btn-confirmar-salida').addEventListener('click', async () => {
      const concepto = document.getElementById('caja-concepto').value.trim();
      if (!concepto) {
        toast('Escribe el concepto de la salida', 'error');
        return;
      }

      const btn = document.getElementById('btn-confirmar-salida');
      btn.disabled = true;
      btn.textContent = 'Registrando...';

      try {
        const datos = {
          ...obtenerDatosBilletes(),
          tipo: 'Salida de Caja',
          responsable: empleadoActual,
          conceptoSalida: concepto,
          nota: document.getElementById('caja-nota').value || ''
        };

        const res = await API.registrarCaja(datos);
        if (res.ok) {
          toast('Salida registrada — ' + money(res.total));
          closeModal();
          cargarCaja();
        } else {
          toast('Error al registrar salida', 'error');
          btn.disabled = false;
          btn.textContent = 'Registrar Salida';
        }
      } catch (err) {
        toast('Error de conexión', 'error');
        btn.disabled = false;
        btn.textContent = 'Registrar Salida';
      }
    });
  }

  function initCaja() {
    $('#btn-apertura-caja').addEventListener('click', modalApertura);
    $('#btn-cierre-caja').addEventListener('click', modalCierre);
    $('#btn-salida-caja').addEventListener('click', modalSalida);
  }

  // ─── INIT ───
  function init() {
    initNav();
    initLogin();
    initCaja();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Exponer para botones inline
  return { closeModal };
})();
