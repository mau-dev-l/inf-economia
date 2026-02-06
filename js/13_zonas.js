// frontend/js/13_zonas.js

document.addEventListener('DOMContentLoaded', function() {
    
    const cmbZonas = document.getElementById('cmbCentralidad');
    const btnLimpiar = document.getElementById('btnLimpiarCentralidad');

    // 1. Cargar la lista
    cargarListaDesplegable();

    // 2. Evento al seleccionar
    if (cmbZonas) {
        cmbZonas.addEventListener('change', async function() {
            const claveZona = this.value; 
            if (!claveZona || claveZona === "") {
                limpiarZona();
                return;
            }
            await activarZona(claveZona);
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            if(cmbZonas) cmbZonas.value = "";
            limpiarZona();
        });
    }

    // --- FUNCIONES ---

    async function cargarListaDesplegable() {
        try {
            cmbZonas.innerHTML = ''; 
            
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "-- Selecciona una Clave --";
            cmbZonas.appendChild(defaultOption);

            const listaClaves = await window.getListaZonas(); 
            
            console.log("Claves recibidas:", listaClaves);

            listaClaves.forEach(claveTexto => {
                if (claveTexto) {
                    const option = document.createElement('option');
                    option.value = claveTexto;       
                    option.textContent = claveTexto; 
                    cmbZonas.appendChild(option);
                }
            });

        } catch (error) {
            console.error("Error cargando lista:", error);
        }
    }

    async function activarZona(claveZona) {
        window.resetearUI_Global();

        try {
            console.log("Buscando zona con clave:", claveZona);
            
            const geojson = await window.getPoligonoZona(claveZona);

            if (!geojson || geojson.features.length === 0) {
                console.warn("No hay mapa para esta clave:", claveZona);
                return;
            }

            const poligono = geojson.features[0];
            const props = poligono.properties;

            const layer = L.geoJSON(poligono, {
                style: { color: '#6f42c1', weight: 4, fillOpacity: 0.2 } 
            }).addTo(capaCentralidades);

            map.fitBounds(layer.getBounds());

            document.getElementById('panelDemografico').classList.remove('d-none');
            window.actualizarDato('valPoblacion', props.pobtot || 0);
            window.actualizarDato('valMujeres', props.pobfem || 0);
            window.actualizarDato('valHombres', props.pobmas || 0);
            window.actualizarDato('valViviendas', props.vivtot || 0);

            document.getElementById('panelTematicas').classList.remove('disabled-panel');
            document.getElementById('conteoNegocios').innerText = "Contando negocios...";

            const bbox = turf.bbox(poligono).join(',');
            const response = await fetch(`${window.API_URL}/denue/?in_bbox=${bbox}`);
            const dataNegocios = await response.json();

            const negociosDentro = dataNegocios.features.filter(pto => turf.booleanPointInPolygon(pto, poligono));
            
            datosPuntosMemoria = { type: "FeatureCollection", features: negociosDentro };
            window.redibujarPuntos();

            // 👇 ACTUALIZAR LEYENDA A PUNTOS
            if (window.actualizarLeyenda) window.actualizarLeyenda('puntos');

            if (typeof window.actualizarGraficas === 'function') {
                window.actualizarGraficas(props.pobmas || 0, props.pobfem || 0, negociosDentro);
            }

        } catch (error) {
            console.error("Error crítico al activar zona:", error);
        }
    }

    function limpiarZona() {
        window.resetearUI_Global();
        if(cmbZonas) cmbZonas.value = "";
        
        // 👇 RESETEAR LEYENDA
        if (window.actualizarLeyenda) window.actualizarLeyenda('reset');
    }
});