// js/03_app.js

document.addEventListener('DOMContentLoaded', function() {
    cargarDropdown();

    // --- A. LÓGICA DE CENTRALIDADES ---
    const combo = document.getElementById('cmbCentralidad');
    if (combo) {
        combo.addEventListener('change', async function(e) {
            const zona = e.target.value;
            window.resetearUI_Global();
    
            if (!zona) return;
    
            const dataZona = await getPoligonoZona(zona);
            if (!dataZona.features || dataZona.features.length === 0) return;
            const poligono = dataZona.features[0];
    
            const layer = L.geoJSON(dataZona, {
                pane: 'fondo',
                style: { color: '#6610f2', weight: 3, fillOpacity: 0.1 }
            }).addTo(capaCentralidades);
            map.fitBounds(layer.getBounds());
    
            document.getElementById('panelDemografico').classList.remove('d-none');
            window.actualizarDato('valPoblacion', poligono.properties.pot || 0);
    
            procesarCensoConTurf(poligono);
    
            document.getElementById('panelTematicas').classList.remove('disabled-panel');
            datosPuntosMemoria = await getNegocios(zona);
            window.redibujarPuntos(); 
        });
    }

    document.querySelectorAll('.filtro-tema').forEach(c => {
        c.addEventListener('change', window.redibujarPuntos);
    });

    // --- C. CAPAS DE CONTEXTO ---
    
    // 1. COLONIAS
    const chkColonias = document.getElementById('chkColonias');
    if (chkColonias) {
        chkColonias.addEventListener('change', async function(e) {
            if(e.target.checked) {
                // CORRECCIÓN: URL de FastAPI
                const response = await fetch(`${window.API_URL}/colonias/`);
                const data = await response.json();
                
                L.geoJSON(data, {
                    pane: 'panelColonias',
                    style: { color: '#6c757d', weight: 1, fillOpacity: 0.05, dashArray: '5, 5' },
                    onEachFeature: (f, l) => l.bindPopup(`<b>Colonia:</b> ${f.properties.nom_asen}`)
                }).addTo(capaColonias);
            } else {
                capaColonias.clearLayers();
            }
        });
    }

    // 2. VIALIDADES
    const chkVialidades = document.getElementById('chkVialidades');
    
    async function cargarVialidadesBBOX() {
        if (!chkVialidades.checked) return;
        
        const bounds = map.getBounds();
        const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',');
        
        // CORRECCIÓN: URL de FastAPI
        const response = await fetch(`${window.API_URL}/vialidades/?in_bbox=${bbox}`);
        const data = await response.json();
        
        capaVialidades.clearLayers(); 
        L.geoJSON(data, {
            pane: 'panelVialidades',
            style: { color: '#343a40', weight: 1.5, opacity: 0.6 }
        }).addTo(capaVialidades);
    }

    if (chkVialidades) {
        chkVialidades.addEventListener('change', function(e) {
            if(e.target.checked) {
                cargarVialidadesBBOX();
                map.on('moveend', cargarVialidadesBBOX);
            } else {
                capaVialidades.clearLayers();
                map.off('moveend', cargarVialidadesBBOX);
            }
        });
    }
});

// --- FUNCIONES AUXILIARES ---

async function cargarDropdown() {
    // getListaZonas ya usa window.API_URL internamente en 02_api.js
    const lista = await getListaZonas(); 
    const combo = document.getElementById('cmbCentralidad');
    if(combo) {
        lista.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item; opt.innerText = item; combo.appendChild(opt);
        });
    }
}

async function procesarCensoConTurf(poligono) {
    document.getElementById('loader-overlay').style.display = 'block';
    
    const bounds = L.geoJSON(poligono).getBounds();
    const bbox = [bounds.getSouthWest().lng, bounds.getSouthWest().lat, bounds.getNorthEast().lng, bounds.getNorthEast().lat].join(',');

    const dataCenso = await getDatosCenso(bbox);
    
    let h = 0, m = 0, v = 0;
    
    if (dataCenso && dataCenso.features) {
        dataCenso.features.forEach(manzana => {
            if (turf.booleanIntersects(manzana, poligono)) {
                h += (manzana.properties.pobmas || 0);
                m += (manzana.properties.pobfem || 0);
                v += (manzana.properties.vivtot || 0);
            }
        });
    }

    window.actualizarDato('valHombres', h);
    window.actualizarDato('valMujeres', m);
    window.actualizarDato('valViviendas', v);
    document.getElementById('loader-overlay').style.display = 'none';
}