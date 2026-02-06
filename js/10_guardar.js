// js/10_guardar.js

document.addEventListener('DOMContentLoaded', function() {
    const btnGuardar = document.getElementById('btnGuardarZona');
    const listaZonas = document.getElementById('listaZonasGuardadas');
    
    // Cargar al inicio
    cargarZonasGuardadas();

    // LÓGICA DE GUARDADO
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async function() {
            const capasDibujo = capaDibujo.getLayers();
            
            if (capasDibujo.length === 0) {
                alert("Primero debes dibujar un polígono para guardarlo.");
                return;
            }

            const nombre = prompt("Ingresa un nombre para esta zona:");
            if (!nombre) return;

            // Tomamos el último dibujo realizado
            const layer = capasDibujo[capasDibujo.length - 1];
            const geojson = layer.toGeoJSON();

            const payload = {
                nombre: nombre,
                geom: {
                    type: "Polygon",
                    coordinates: geojson.geometry.coordinates
                }
            };

            try {
                // CORRECCIÓN: URL Global y sin CSRF Token
                const response = await fetch(`${window.API_URL}/mis_zonas/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("✅ Zona guardada correctamente");
                    cargarZonasGuardadas();
                    
                    const tabElement = document.getElementById('tab-zonas-link');
                    if(tabElement) {
                        const tabTrigger = new bootstrap.Tab(tabElement);
                        tabTrigger.show();
                    }
                } else {
                    console.error(await response.text());
                    alert("Error al guardar. (Asegúrate de haber creado la tabla 'mis_zonas' en la BD)");
                }
            } catch (error) {
                console.error("Error de red:", error);
            }
        });
    }

    // LÓGICA DE LISTADO
    async function cargarZonasGuardadas() {
        if (!listaZonas) return;
        listaZonas.innerHTML = '<div class="text-center small text-muted mt-3">Cargando...</div>';

        try {
            // CORRECCIÓN: URL Global
            const response = await fetch(`${window.API_URL}/mis_zonas/`);
            
            if (!response.ok) {
                // Si la tabla no existe o falla, mostramos silencio por ahora
                listaZonas.innerHTML = '<div class="text-center small text-muted mt-3">No hay zonas (o servicio no disponible).</div>';
                return;
            }

            const data = await response.json();
            listaZonas.innerHTML = ''; 

            let features = data.features || data || [];

            if (!features || features.length === 0) {
                listaZonas.innerHTML = '<div class="text-center small text-muted mt-3">No tienes zonas guardadas aún.</div>';
                return;
            }

            features.forEach(zona => {
                let textoArea = "N/A";
                try {
                    const areaM2 = turf.area(zona);
                    if (areaM2 > 10000) {
                        textoArea = (areaM2 / 10000).toFixed(2) + " has";
                    } else {
                        textoArea = areaM2.toFixed(1) + " m²";
                    }
                } catch(e) { }

                // Crear Tarjeta
                const card = document.createElement('div');
                card.className = 'card mb-2 shadow-sm border-0';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-start">
                            <div style="overflow: hidden;">
                                <h6 class="mb-1 fw-bold text-primary text-truncate">${zona.properties.nombre}</h6>
                                <p class="mb-0 small text-muted">Zona Personalizada</p>
                                <span class="badge bg-light text-dark border mt-1">
                                     ${textoArea}
                                </span>
                            </div>
                            <button class="btn btn-sm btn-outline-danger btn-borrar border-0 ms-2" title="Eliminar">
                                &times;
                            </button>
                        </div>
                    </div>
                `;

                card.addEventListener('click', (e) => {
                    if(e.target.closest('.btn-borrar')) return;
                    cargarZonaEnMapa(zona);
                });
                
                const btnBorrar = card.querySelector('.btn-borrar');
                btnBorrar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    eliminarZona(zona.id || zona.properties.id);
                });

                listaZonas.appendChild(card);
            });

        } catch (error) {
            console.error("Error cargando zonas:", error);
            listaZonas.innerHTML = '<div class="text-danger small text-center mt-3">Error de conexión</div>';
        }
    }

    function cargarZonaEnMapa(zonaGeoJSON) {
        if (typeof window.resetearUI_Global === 'function') window.resetearUI_Global();

        const layer = L.geoJSON(zonaGeoJSON, {
            style: { color: '#ffc107', weight: 3, dashArray: '5, 5' }
        }).addTo(capaDibujo);

        map.fitBounds(layer.getBounds());
        
        if (typeof window.ejecutarAnalisisPoligono === 'function') {
            window.ejecutarAnalisisPoligono(zonaGeoJSON);
        }
    }

    async function eliminarZona(id) {
        if(!confirm("¿Eliminar esta zona?")) return;
        
        try {
            // CORRECCIÓN: URL Global
            const response = await fetch(`${window.API_URL}/mis_zonas/${id}`, {
                method: 'DELETE'
            });
            
            if(response.ok) {
                cargarZonasGuardadas();
            } else {
                alert("Error al eliminar.");
            }
        } catch(e) {
            console.error(e);
        }
    }
});