// frontend/js/14_calor.js

console.log("✅ Script de Mapa de Calor (Versión Final) CARGADO.");

let capaCalor = null; 

document.addEventListener('DOMContentLoaded', () => {
    const chkCalor = document.getElementById('chkMapaCalor');
    
    if (chkCalor) {
        chkCalor.addEventListener('change', function() {
            if (this.checked) {
                activarModoCalor();
            } else {
                desactivarModoCalor();
            }
        });
    }
});

function activarModoCalor() {
    if (!window.datosPuntosMemoria || !window.datosPuntosMemoria.features || window.datosPuntosMemoria.features.length === 0) {
        alert("⚠️ Primero selecciona una zona para cargar datos.");
        document.getElementById('chkMapaCalor').checked = false;
        return;
    }

    console.log(`Generando calor con ${window.datosPuntosMemoria.features.length} puntos...`);

    map.eachLayer(function (layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    const puntosCalor = window.datosPuntosMemoria.features.map(pto => {
        if (pto.geometry && pto.geometry.coordinates) {
            return [
                pto.geometry.coordinates[1], 
                pto.geometry.coordinates[0], 
                0.6 
            ];
        }
    }).filter(p => p); 

    if (capaCalor) map.removeLayer(capaCalor);

    if (typeof L.heatLayer !== 'function') {
        console.error("Error: L.heatLayer no es una función.");
        return;
    }

    capaCalor = L.heatLayer(puntosCalor, {
        radius: 25,       
        blur: 15,         
        maxZoom: 15,
        minOpacity: 0.4,
        gradient: {
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }
    }).addTo(map);

    // 👇 CAMBIAR LEYENDA A CALOR
    if (window.actualizarLeyenda) window.actualizarLeyenda('calor');
}

function desactivarModoCalor() {
    console.log("Desactivando modo calor...");

    if (capaCalor) {
        map.removeLayer(capaCalor);
        capaCalor = null;
    }
    
    if (typeof window.redibujarPuntos === 'function') {
        window.redibujarPuntos();
    }

    // 👇 RESTAURAR LEYENDA A PUNTOS
    if (window.actualizarLeyenda) window.actualizarLeyenda('puntos');
}