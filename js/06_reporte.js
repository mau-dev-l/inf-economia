document.addEventListener('DOMContentLoaded', function() {
    const btnReporte = document.getElementById('btnGenerarReporte');

    btnReporte.addEventListener('click', async function() {
        // 1. Feedback visual (Cambiamos el botón para que sepan que está trabajando)
        const textoOriginal = btnReporte.innerHTML;
        btnReporte.innerHTML = ' Generando PDF...';
        btnReporte.disabled = true;

        try {
            // 2. Inicializar jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const fecha = new Date().toLocaleDateString('es-MX');
            const hora = new Date().toLocaleTimeString('es-MX');

            // --- ENCABEZADO ---
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 40);
            doc.text("Reporte de Análisis Territorial", 105, 20, null, null, "center");
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Sistema OVIE Tuxtla Gutiérrez | Fecha: ${fecha} ${hora}`, 105, 28, null, null, "center");

            doc.setDrawColor(200);
            doc.line(20, 32, 190, 32); // Línea separadora

            // --- CAPTURA DEL MAPA ---
            // Usamos html2canvas para "fotografiar" el div del mapa
            const mapaDiv = document.getElementById('map');
            
            // Opciones críticas para que Leaflet se renderice bien
            const canvas = await html2canvas(mapaDiv, {
                useCORS: true,       // Permite cargar imágenes externas (mapas base)
                allowTaint: true,
                logging: false,
                ignoreElements: (element) => {
                    // Opcional: Ignorar botones de zoom si quieres el mapa limpio
                    return element.classList.contains('leaflet-control-zoom');
                }
            });

            const imgData = canvas.toDataURL('image/png');
            // Ajustamos la imagen al ancho del PDF (A4 = 210mm ancho)
            const imgWidth = 170; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            doc.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);

            // --- DATOS DEMOGRÁFICOS ---
            let yPos = 40 + imgHeight + 10; // Posición vertical dinámica debajo del mapa

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Resumen Sociodemográfico", 20, yPos);
            
            yPos += 8;
            doc.setFontSize(11);
            doc.setTextColor(50);
            
            // Extraer valores actuales del HTML
            const pobTotal = document.getElementById('valPoblacion').innerText;
            const mujeres = document.getElementById('valMujeres').innerText;
            const hombres = document.getElementById('valHombres').innerText;
            const viviendas = document.getElementById('valViviendas').innerText;

            // Dibujar "Tabla" simple
            doc.text(`• Población Total Estimada: ${pobTotal} habs.`, 25, yPos);
            doc.text(`• Mujeres: ${mujeres}`, 25, yPos + 6);
            doc.text(`• Hombres: ${hombres}`, 25, yPos + 12);
            doc.text(`• Viviendas Particulares: ${viviendas}`, 25, yPos + 18);

            // --- DATOS ECONÓMICOS ---
            yPos += 30; // Salto de línea
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Unidades Económicas (DENUE)", 20, yPos);

            yPos += 8;
            doc.setFontSize(11);
            doc.setTextColor(50);
            
            // Obtener conteo de negocios visibles (Un truco: leemos la memoria global o el DOM)
            // Si quieres ser preciso, leemos la variable global 'datosPuntosMemoria'
            let totalNegocios = 0;
            if (typeof datosPuntosMemoria !== 'undefined' && datosPuntosMemoria.features) {
                totalNegocios = datosPuntosMemoria.features.length;
            }
            
            const zonaSeleccionada = document.getElementById('txtBuscar').value || 
                                     document.getElementById('cmbCentralidad').value || 
                                     "Zona Personalizada";

            doc.text(`• Zona Analizada: ${zonaSeleccionada}`, 25, yPos);
            doc.text(`• Total de Negocios Identificados: ${totalNegocios}`, 25, yPos + 6);
            doc.text(`• Fuente: INEGI DENUE / Censo 2020`, 25, yPos + 12);

            // --- PIE DE PÁGINA ---
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Este reporte es de carácter informativo. Geoportal Desarrollado por Ing. Yahir.", 105, 285, null, null, "center");

            // 3. Descargar
            doc.save(`Reporte_OVIE_${fecha.replace(/\//g, '-')}.pdf`);

        } catch (error) {
            console.error("Error generando PDF:", error);
            alert("Hubo un error al generar el reporte. Revisa la consola.");
        } finally {
            // Restaurar botón
            btnReporte.innerHTML = textoOriginal;
            btnReporte.disabled = false;
        }
    });
});