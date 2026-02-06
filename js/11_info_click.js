// frontend/js/11_info_click.js

document.addEventListener('DOMContentLoaded', function() {
    
    // Esperamos medio segundo para asegurar que el mapa cargó
    setTimeout(() => {
        if (typeof map === 'undefined') {
            console.warn("El mapa aún no está listo.");
            return;
        }

        // Escuchar clics en el mapa
        map.on('click', async function(e) {
            
            var lat = e.latlng.lat;
            var lon = e.latlng.lng;
            
            // Usamos la variable global API_URL
            var url = `${window.API_URL}/info-manzana/?lat=${lat}&lon=${lon}`;

            try {
                var response = await fetch(url);
                var data = await response.json();

                if (data.mensaje) {
                    console.log("Clic fuera de manzana censal");
                    return; // No mostramos popup si no hay dato
                }

                var contenido = `
                    <div style="font-family: Arial; min-width: 200px;">
                        <h3 style="margin: 0 0 5px; color: #d32f2f;">Manzana: ${data.clave_geo ? data.clave_geo.slice(-4) : ''}</h3>
                        <hr style="margin: 5px 0;">
                        <b>👥 Pob. Total:</b> ${data.poblacion_total} hab.<br>
                        <b>🏠 Viviendas:</b> ${data.viviendas}<br>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                            <span>👨 ${data.hombres}</span>
                            <span>👩 ${data.mujeres}</span>
                        </div>
                        <small style="color: #666; font-size: 10px;">Clave: ${data.clave_geo}</small>
                    </div>
                `;

                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(contenido)
                    .openOn(map);

            } catch (error) {
                console.error("Error al obtener info:", error);
            }
        });
    }, 1000); // Retardo de seguridad
});