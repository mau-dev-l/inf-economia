// js/05_buscador.js

document.addEventListener('DOMContentLoaded', function() {
    const inputBuscar = document.getElementById('txtBuscar');
    const listaResultados = document.getElementById('listaResultados');
    const btnLimpiar = document.getElementById('btnLimpiarBuscador');
    
    let coloniasCache = []; 

    // 1. Cargar TODAS las colonias al iniciar
    cargarBaseDeDatosColonias();

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            inputBuscar.value = '';
            listaResultados.style.display = 'none';
            window.resetearUI_Global();
            inputBuscar.focus();
        });
    }

    async function cargarBaseDeDatosColonias() {
        try {
            // Usamos la variable global definida en 02_api.js
            const response = await fetch(`${window.API_URL}/colonias/`);
            const data = await response.json();
            
            coloniasCache = data.features || []; 
            console.log(`Buscador listo: ${coloniasCache.length} colonias cargadas.`);
        } catch (error) {
            console.error("Error cargando índice de búsqueda. (¿Está corriendo uvicorn?):", error);
        }
    }

    // 2. Escuchar escritura
    inputBuscar.addEventListener('input', function() {
        const texto = this.value;
        if (texto.length < 2) { 
            listaResultados.style.display = 'none';
            return;
        }
        realizarBusquedaInteligente(texto);
    });

    // 3. Función de Búsqueda
    function realizarBusquedaInteligente(textoUsuario) {
        if (!coloniasCache) return;
        const terminoLimpio = normalizarTexto(textoUsuario);

        const coincidencias = coloniasCache.filter(feature => {
            const nombreColonia = normalizarTexto(feature.properties.nom_asen || '');
            return nombreColonia.includes(terminoLimpio);
        });

        mostrarResultados(coincidencias);
    }

    function normalizarTexto(texto) {
        return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    // 4. Mostrar lista
    function mostrarResultados(resultados) {
        listaResultados.innerHTML = ''; 
        
        if (resultados.length === 0) {
            listaResultados.style.display = 'none';
            return;
        }

        resultados.forEach(feature => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action cursor-pointer border-bottom';
            const tipo = feature.properties.tipo_asen || 'Colonia';
            const nombre = feature.properties.nom_asen;
            
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <span class="small fw-bold text-dark">${nombre}</span>
                </div>
                <small class="text-muted" style="font-size:0.75rem;">${tipo}</small>
            `;
            item.addEventListener('click', () => seleccionarColonia(feature));
            listaResultados.appendChild(item);
        });

        listaResultados.style.display = 'block';
    }

    // 5. Al seleccionar (AQUÍ ESTÁ LA MAGIA DE LAS GRÁFICAS)
    async function seleccionarColonia(colonia) {
        window.resetearUI_Global();
        
        listaResultados.style.display = 'none';
        inputBuscar.value = colonia.properties.nom_asen; 
        
        // Dibujar contorno
        const layer = L.geoJSON(colonia, {
            pane: 'fondo',
            style: { color: '#20c997', weight: 4, fillOpacity: 0.2 } 
        }).addTo(capaCentralidades); 
        
        map.fitBounds(layer.getBounds());

        // Actualizar Textos
        document.getElementById('panelDemografico').classList.remove('d-none');
        window.actualizarDato('valPoblacion', colonia.properties.pobtot || 0);
        window.actualizarDato('valMujeres', colonia.properties.pobfem || 0);
        window.actualizarDato('valHombres', colonia.properties.pobmas || 0);
        window.actualizarDato('valViviendas', colonia.properties.vivtot || 0);

        // Actualizar Negocios
        document.getElementById('panelTematicas').classList.remove('disabled-panel');
        document.getElementById('conteoNegocios').innerText = "Analizando negocios...";
        
        const bbox = turf.bbox(colonia).join(',');
        const response = await fetch(`${window.API_URL}/denue/?in_bbox=${bbox}`);
        const dataNegocios = await response.json();

        const negociosDentro = dataNegocios.features.filter(pto => turf.booleanPointInPolygon(pto, colonia));
        
        datosPuntosMemoria = { type: "FeatureCollection", features: negociosDentro };
        window.redibujarPuntos();

        // 👇 ¡AQUÍ CONECTAMOS LAS GRÁFICAS! 👇
        if (typeof window.actualizarGraficas === 'function') {
            window.actualizarGraficas(
                colonia.properties.pobmas || 0, // Hombres
                colonia.properties.pobfem || 0, // Mujeres
                negociosDentro                  // Datos para barras
            );
        }
    }
    
    document.addEventListener('click', function(e) {
        if (e.target !== inputBuscar && e.target !== listaResultados) {
            listaResultados.style.display = 'none';
        }
    });
});