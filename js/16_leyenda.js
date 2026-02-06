// frontend/js/16_leyenda.js

// Definimos la función GLOBALMENTE fuera del evento para asegurar que exista siempre
window.toggleLeyendaVialidades = function(activo) {
    console.log("🎨 Intentando cambiar leyenda WMS. Estado:", activo);
    
    const container = document.getElementById('legend-extras');
    
    if (!container) {
        console.warn("⚠️ Aún no existe el contenedor 'legend-extras'. El mapa se está cargando.");
        return;
    }

    if (activo) {
        // Construimos la URL de la imagen de la leyenda
        // NOTA: Ajustamos para que coincida exactamente con tu capa
        const urlLeyenda = "https://sigetux.tuxtla.gob.mx:8443/geoserver/ovie_tuxtla/wms" + 
                           "?REQUEST=GetLegendGraphic" +
                           "&VERSION=1.0.0" +
                           "&FORMAT=image/png" +
                           "&WIDTH=20&HEIGHT=20" + 
                           "&LAYER=ovie_tuxtla:VIALIDADES_TUXTLA_UTM" + 
                           "&LEGEND_OPTIONS=forceLabels:on;fontName:Arial;fontSize:11;fontColor:0x333333";

        console.log("🔗 URL Leyenda:", urlLeyenda);

        container.style.display = 'block';
        container.innerHTML = `
            <div class="mt-2 pt-2 border-top">
                <h6 class="mb-1" style="font-size:12px; font-weight:bold;">Red Vial</h6>
                <div style="text-align:left;">
                    <img src="${urlLeyenda}" alt="Cargando simbología..." style="max-width: 100%; min-height: 20px;">
                </div>
            </div>
        `;
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    
    // Crear el Control de Leaflet
    const leyendaControl = L.control({position: 'bottomright'});

    leyendaControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.id = 'map-legend';
        
        // ESTRUCTURA BASE
        div.innerHTML = `
            <h6>Simbología</h6>
            
            <div id="legend-content">
                <small class="text-muted">Selecciona una zona<br>para ver datos.</small>
            </div>

            <div id="legend-extras" style="display:none;"></div>

            <div class="mt-2 pt-2 border-top">
                <div class="legend-item">
                    <span class="linea-ref"></span> <span class="small text-muted">Límites Barriales</span>
                </div>
            </div>
        `;
        return div;
    };

    leyendaControl.addTo(map);

    // Función para actualizar la parte de Puntos/Calor
    window.actualizarLeyenda = function(modo) {
        const container = document.getElementById('legend-content');
        if (!container) return;

        let html = '';
        if (modo === 'puntos') {
            html += `
                <div class="legend-item"><span class="dot" style="background:#ff6384;"></span> Comercio</div>
                <div class="legend-item"><span class="dot" style="background:#36a2eb;"></span> Servicios</div>
                <div class="legend-item"><span class="dot" style="background:#ffcd56;"></span> Industria</div>
            `;
        } else if (modo === 'calor') {
            html += `
                <div class="mb-1 small text-center fw-bold text-dark">Densidad Económica</div>
                <div class="legend-gradient"></div>
                <div class="legend-labels">
                    <span>Baja</span>
                    <span>Media</span>
                    <span>Alta</span>
                </div>
            `;
        } else {
            html = '<small class="text-muted">Esperando selección...</small>';
        }
        container.innerHTML = html;
    };

    console.log("✅ Módulo de Simbología (v2) cargado.");
});