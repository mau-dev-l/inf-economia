// frontend/js/17_extras.js

// Variables para paginación
let paginaActual = 1;
const filasPorPagina = 10;
let modalBootstrap = null;

document.addEventListener('DOMContentLoaded', () => {
    
    const btnTabla = document.getElementById('btnVerTabla');
    const btnKMZ = document.getElementById('btnDescargarKMZ');
    
    // Inicializar Modal de Bootstrap
    const modalElement = document.getElementById('modalTabla');
    if (modalElement) {
        modalBootstrap = new bootstrap.Modal(modalElement);
    }

    // --- EVENTO 1: ABRIR TABLA ---
    if (btnTabla) {
        btnTabla.addEventListener('click', () => {
            if (!validarDatos()) return;
            
            paginaActual = 1; // Resetear a la primera página
            renderizarTabla();
            modalBootstrap.show();
        });
    }

    // Controles de Paginación
    document.getElementById('btnAnterior').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById('btnSiguiente').addEventListener('click', () => {
        const total = window.datosPuntosMemoria.features.length;
        const maxPaginas = Math.ceil(total / filasPorPagina);
        if (paginaActual < maxPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    // --- EVENTO 2: DESCARGAR KML/KMZ ---
    if (btnKMZ) {
        btnKMZ.addEventListener('click', () => {
            if (!validarDatos()) return;
            generarYDescargarKML();
        });
    }
});

// --- FUNCIONES AUXILIARES ---

function validarDatos() {
    if (!window.datosPuntosMemoria || !window.datosPuntosMemoria.features || window.datosPuntosMemoria.features.length === 0) {
        alert("⚠️ No hay datos filtrados para mostrar o descargar. Primero selecciona una zona.");
        return false;
    }
    return true;
}

function renderizarTabla() {
    const cuerpo = document.getElementById('tablaCuerpo');
    const info = document.getElementById('infoPaginacion');
    const datos = window.datosPuntosMemoria.features;
    
    cuerpo.innerHTML = ''; // Limpiar

    // Calcular índices
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = Math.min(inicio + filasPorPagina, datos.length);

    // Generar filas
    for (let i = inicio; i < fin; i++) {
        const props = datos[i].properties;
        const fila = document.createElement('tr');
        
        // Ajusta estas propiedades según lo que venga de tu API (denue)
        fila.innerHTML = `
            <td>${props.nom_estab || 'Sin nombre'}</td>
            <td>${props.nombre_act || 'Sin actividad'}</td>
            <td><span class="badge bg-secondary">${props.codigo_act || 'N/A'}</span></td>
        `;
        cuerpo.appendChild(fila);
    }

    // Actualizar texto informativo
    info.innerText = `Mostrando ${inicio + 1}-${fin} de ${datos.length}`;
    
    // Estado de botones
    document.getElementById('btnAnterior').disabled = (paginaActual === 1);
    document.getElementById('btnSiguiente').disabled = (fin >= datos.length);
}

function generarYDescargarKML() {
    const datos = window.datosPuntosMemoria.features;
    console.log(`Generando KML para ${datos.length} puntos...`);

    // 1. Construir cabecera KML
    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Exportacion_MUET_Tuxtla</name>
    <Style id="punto"><IconStyle><scale>0.8</scale></IconStyle></Style>`;

    // 2. Iterar puntos y crear Placemarks
    datos.forEach(feat => {
        const props = feat.properties;
        const coords = feat.geometry.coordinates; // [lng, lat]
        
        // Limpiar caracteres especiales para XML
        const nombre = (props.nom_estab || 'Sin nombre').replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const desc = (props.nombre_act || '').replace(/&/g, '&amp;');

        kmlContent += `
    <Placemark>
      <name>${nombre}</name>
      <description>${desc}</description>
      <styleUrl>#punto</styleUrl>
      <Point>
        <coordinates>${coords[0]},${coords[1]},0</coordinates>
      </Point>
    </Placemark>`;
    });

    // 3. Cerrar KML
    kmlContent += `
  </Document>
</kml>`;

    // 4. Crear Blob y Descargar
    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `denue_export_${new Date().getTime()}.kml`; // .kml abre directo en Google Earth
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}