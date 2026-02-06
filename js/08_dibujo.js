// js/08_dibujo.js

document.addEventListener('DOMContentLoaded', function() {
    const btnDibujar = document.getElementById('btnDibujarPoligono');
    const msgInstrucciones = document.getElementById('msgDibujo');
    
    let drawer = null;

    if (btnDibujar) {
        btnDibujar.addEventListener('click', function() {
            window.resetearUI_Global();
            
            msgInstrucciones.style.display = 'block';
            btnDibujar.classList.replace('btn-outline-success', 'btn-success');
            btnDibujar.innerText = '✏️ Dibujando...';
            
            drawer = new L.Draw.Polygon(map, {
                shapeOptions: {
                    color: '#28a745',
                    fillColor: '#28a745',
                    fillOpacity: 0.2,
                    weight: 2
                },
                allowIntersection: false,
                showArea: true
            });
            
            drawer.enable();
        });
    }

    map.on(L.Draw.Event.CREATED, async function (e) {
        const layer = e.layer;
        
        if(btnDibujar) {
            btnDibujar.classList.replace('btn-success', 'btn-outline-success');
            btnDibujar.innerText = '✏️ Dibujar Polígono';
            msgInstrucciones.style.display = 'none';
        }

        capaDibujo.addLayer(layer);
        
        const geojson = layer.toGeoJSON();
        // Guardamos función global para que 10_guardar.js la pueda reusar
        window.ejecutarAnalisisPoligono(geojson);
    });
});

// Hacemos la función global (window) para compartirla
window.ejecutarAnalisisPoligono = async function(poligonoGeoJSON) {
    document.getElementById('panelDemografico').classList.remove('d-none');
    document.getElementById('loader-overlay').style.display = 'block';

    const bbox = turf.bbox(poligonoGeoJSON).join(',');

    // --- ANÁLISIS CENSAL ---
    const dataCenso = await getDatosCenso(bbox);
    
    let pobTotal = 0, h = 0, m = 0, v = 0;

    if (dataCenso.features) {
        dataCenso.features.forEach(manzana => {
            if (turf.booleanIntersects(manzana, poligonoGeoJSON)) {
                pobTotal += (manzana.properties.pobtot || 0);
                h += (manzana.properties.pobmas || 0);
                m += (manzana.properties.pobfem || 0);
                v += (manzana.properties.vivtot || 0);
            }
        });
    }

    window.actualizarDato('valPoblacion', pobTotal);
    window.actualizarDato('valMujeres', m);
    window.actualizarDato('valHombres', h);
    window.actualizarDato('valViviendas', v);

    // --- ANÁLISIS ECONÓMICO ---
    document.getElementById('panelTematicas').classList.remove('disabled-panel');
    document.getElementById('conteoNegocios').innerText = "Analizando...";
    
    // CORRECCIÓN: Usamos window.API_URL
    const response = await fetch(`${window.API_URL}/denue/?in_bbox=${bbox}`);
    const dataNegocios = await response.json();

    const negociosDentro = dataNegocios.features.filter(punto => {
        return turf.booleanPointInPolygon(punto, poligonoGeoJSON);
    });

    datosPuntosMemoria = { type: "FeatureCollection", features: negociosDentro };
    window.redibujarPuntos();

    document.getElementById('loader-overlay').style.display = 'none';
    
    // Capa temporal para zoom
    const tempLayer = L.geoJSON(poligonoGeoJSON); 
    map.fitBounds(tempLayer.getBounds()); 
};