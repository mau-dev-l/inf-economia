// frontend/js/18_wms.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("📡 Conectando con GeoServer (WMS)...");

    // 1. Definir la Capa WMS
    const capaVialidadesWMS = L.tileLayer.wms('https://sigetux.tuxtla.gob.mx:8443/geoserver/ovie_tuxtla/wms', {
        layers: 'ovie_tuxtla:VIALIDADES_TUXTLA_UTM', 
        format: 'image/png',
        transparent: true,
        version: '1.1.0',       
        attribution: 'SIGETUX',
        zIndex: 500             
    });
    const capaCentralidadBarrialWMS = L.tileLayer.wms('https://sigetux.tuxtla.gob.mx:8443/geoserver/ovie_tuxtla/wms', {
        layers: 'ovie_tuxtla:centralidad_barrial02', 
        format: 'image/png',
        transparent: true,
        version: '1.1.0',       
        attribution: 'SIGETUX',
        zIndex: 500             
    });
    capaCentralidadBarrialWMS.addTo(map); // Agrega la capa de centralidad barrial al mapa por defecto

    // 2. Reemplazar la lógica del checkbox existente
    const oldChk = document.getElementById('chkVialidades');
    
    if (oldChk) {
        // Clonamos el botón para eliminar eventos anteriores
        const newChk = oldChk.cloneNode(true);
        oldChk.parentNode.replaceChild(newChk, oldChk);

        // 3. Asignar la nueva lógica WMS
        newChk.addEventListener('change', function() {
            if (this.checked) {
                console.log("🛣️ Mostrando Vialidades (WMS)");
                capaVialidadesWMS.addTo(map);

                // 👇 ¡ESTA ES LA LÍNEA QUE FALTABA! 👇
                // Le avisa a la leyenda que debe mostrar la imagen
                if (window.toggleLeyendaVialidades) {
                    window.toggleLeyendaVialidades(true);
                }

            } else {
                console.log("Ocultando Vialidades");
                map.removeLayer(capaVialidadesWMS);

                // 👇 Y ESTA PARA OCULTARLA 👇
                if (window.toggleLeyendaVialidades) {
                    window.toggleLeyendaVialidades(false);
                }
            }
        });

        console.log("✅ Switch de Vialidades actualizado a WMS + Leyenda.");
    }
});