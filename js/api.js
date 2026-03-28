/* ============================================================
   DIAMOND BOUTIQUE — API Layer
   Conexión con Google Apps Script Web App
   ============================================================ */

const API = (() => {
  const BASE = 'https://script.google.com/macros/s/AKfycbwvEGVHq9htougq3fLNlITXcNA-qJpdU-N7Gj4-Jis_USOXqjMDpt3pJKWeCz7R9pfDoQ/exec';

  async function get(accion, params = {}) {
    const url = new URL(BASE);
    url.searchParams.set('accion', accion);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Error de red: ' + res.status);
    return res.json();
  }

  async function post(data) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error de red: ' + res.status);
    return res.json();
  }

  return {
    obtenerClaves: () => get('obtenerClaves'),
    obtenerEmpleados: () => get('obtenerEmpleados'),
    obtenerDashboard: () => get('obtenerDashboard'),
    listarTrajes: () => get('listarTrajes'),
    buscarTraje: (codigo) => get('buscarTraje', { codigo }),
    buscarTrajePorNombre: (texto) => get('buscarTrajePorNombre', { texto }),
    agregarTraje: (datos) => post({ accion: 'agregarTraje', ...datos }),
    listarAccesorios: () => get('listarAccesorios'),
    agregarAccesorio: (datos) => post({ accion: 'agregarAccesorio', ...datos }),
    obtenerAlquiler: (num) => get('obtenerAlquiler', { num }),
    verificarFactura: (num) => get('verificarFactura', { num }),
    registrarAlquiler: (datos) => post({ accion: 'registrarAlquiler', ...datos }),
    editarAlquiler: (datos) => post({ accion: 'editarAlquiler', ...datos }),
    marcarDevuelto: (numFactura) => post({ accion: 'marcarDevuelto', numFactura }),
    registrarPago: (datos) => post({ accion: 'registrarPago', ...datos }),
    estadoCaja: () => get('estadoCaja'),
    registrarCaja: (datos) => post({ accion: 'registrarCaja', ...datos }),
    registrarGasto: (datos) => post({ accion: 'registrarGasto', ...datos }),
    asistenciaHoy: () => get('asistenciaHoy'),
    registrarAsistencia: (datos) => post({ accion: 'registrarAsistencia', ...datos }),
  };
})();
