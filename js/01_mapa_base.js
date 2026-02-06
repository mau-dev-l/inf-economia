// VARIABLES GLOBALES (Para que todos los scripts las vean)
var map;
var capaCentralidades;
var capaPuntos; // Capa visual de puntos
var datosPuntosMemoria = { type: "FeatureCollection", features: [] }; // Almacén de datos crudos
var capaDibujo; // Nueva capa para el círculo del radio
var capaColonias;   // Nueva
var capaVialidades; // Nueva

document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicializar Mapa
    map = L.map('map').setView([16.753, -93.115], 13);

    // 2. Mapa Base
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // 3. Paneles Z-Index
    map.createPane('fondo'); map.getPane('fondo').style.zIndex = 300;
    map.createPane('frente'); map.getPane('frente').style.zIndex = 500;
    map.createPane('panelColonias'); map.getPane('panelColonias').style.zIndex = 200;
    map.createPane('panelVialidades'); map.getPane('panelVialidades').style.zIndex = 400; // Encima de zonas

    // 4. Inicializar Capas
    capaCentralidades = L.layerGroup().addTo(map);
    capaPuntos = L.layerGroup().addTo(map);
    capaDibujo = L.layerGroup().addTo(map); // Capa para dibujar el radio
    capaColonias = L.layerGroup().addTo(map);
    capaVialidades = L.layerGroup().addTo(map); // Vialidades apagadas por defecto si quieres, o prendidas
});

// --- FUNCIONES COMPARTIDAS (UTILERÍAS) ---

// Función para filtrar y dibujar puntos en el mapa
window.redibujarPuntos = function() {
    capaPuntos.clearLayers();
    
    // Leer qué checkboxes están activos
    const checks = document.querySelectorAll('.filtro-tema:checked');
    const activos = Array.from(checks).map(c => c.value);
    let contador = 0;

    if (datosPuntosMemoria && datosPuntosMemoria.features) {
        L.geoJSON(datosPuntosMemoria, {
            pane: 'frente',
            filter: function(feature) {
                return activos.includes(getCategoria(feature.properties.codigo_act));
            },
            pointToLayer: function (feature, latlng) {
                contador++;
                return L.circleMarker(latlng, {
                    radius: 5,
                    fillColor: getColor(getCategoria(feature.properties.codigo_act)),
                    color: "#fff", weight: 1, fillOpacity: 0.9
                });
            },
            onEachFeature: function(f, l) {
                l.bindPopup(`<b>${f.properties.nom_estab}</b><br>${f.properties.nombre_act}`);
            }
        }).addTo(capaPuntos);
    }
    
    // Actualizar conteo en el HTML si existe el elemento
    const lblConteo = document.getElementById('conteoNegocios');
    if(lblConteo) lblConteo.innerText = `${contador} negocios visibles`;
};

window.getCategoria = function(c) { 
    if(!c) return 'otros';
    const s = parseInt(String(c).trim().substring(0, 2));
    if (s === 43 || s === 46) return 'comercio';
    if (s >= 31 && s <= 33) return 'industria';
    if (s >= 50 && s <= 93) return 'servicios';
    return 'otros';
};

window.getColor = function(c) {
    return c === 'comercio' ? '#dc3545' : c === 'industria' ? '#ffc107' : c === 'servicios' ? '#0d6efd' : '#6c757d';
};

window.actualizarDato = function(id, valor) {
    const el = document.getElementById(id);
    if(el) el.innerText = Math.round(valor).toLocaleString('es-MX');
};

window.resetearUI_Global = function() {
    capaCentralidades.clearLayers();
    capaDibujo.clearLayers();
    capaPuntos.clearLayers();
    datosPuntosMemoria = { type: "FeatureCollection", features: [] };
    
    document.getElementById('panelDemografico').classList.add('d-none');
    document.getElementById('panelTematicas').classList.add('disabled-panel');
    ['valPoblacion','valHombres','valMujeres','valViviendas'].forEach(id => actualizarDato(id, 0));
};