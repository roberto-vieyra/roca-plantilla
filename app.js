// ======================================
// ELEMENTOS PRINCIPALES
// ======================================

const bodyTable = document.getElementById('bodyTable');
const addRow = document.getElementById('addRow');
const btnDescargar = document.getElementById("btnDescargar");
const btnNuevoFolio = document.getElementById("nuevoFolio");

const cliente = document.getElementById("cliente");
const empresa = document.getElementById("empresa");
const proyecto = document.getElementById("proyecto");
const fecha = document.getElementById("fecha");

const cargo = document.getElementById("cargo");
const rfcCliente = document.getElementById("rfcCliente");
const email = document.getElementById("email");
const telefono = document.getElementById("telefono");
const direccion = document.getElementById("direccion");

const servicio = document.getElementById("servicio");
const ubicacion =document.getElementById("ubicacion");
const duracion = document.getElementById("duracion");
const responsable = document.getElementById("responsable");

// ======================================
// EVENTOS DEL FORMULARIO
// ======================================

cliente.addEventListener("input", actualizarPDF);
empresa.addEventListener("input", actualizarPDF);
proyecto.addEventListener("input", actualizarPDF);
fecha.addEventListener("input", actualizarPDF);
cargo.addEventListener("input", actualizarPDF);
rfcCliente.addEventListener("input", actualizarPDF);
email.addEventListener("input", actualizarPDF);
telefono.addEventListener("input", actualizarPDF);
direccion.addEventListener("input", actualizarPDF);
servicio.addEventListener("input", actualizarPDF);
ubicacion.addEventListener("input",actualizarPDF);

duracion.addEventListener(
    "input",
    actualizarPDF
);

responsable.addEventListener(
    "input",
    actualizarPDF
);
addRow.addEventListener('click', agregarFila);
btnDescargar.addEventListener("click", descargarPDF);

// CORRECCIÓN: Este evento debe asignarse una sola vez, no dentro de actualizarPDF()
btnNuevoFolio.addEventListener("click", () => {
    guardarSiguienteFolio();
    generarFolio();
});

// ======================================
// AGREGAR FILA
// ======================================

function agregarFila() {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><input type="number" class="cantidad" value="1" min="0"></td>
        <td><input type="text" class="unidad" placeholder="Servicio"></td>
        <td><input type="text" class="descripcion" placeholder="Descripción"></td>
        <td><input type="number" class="precio" value="0" min="0" step="0.01"></td>
        <td class="importe">$0.00</td>
        <td><button class="eliminar btn-delete">X</button></td>
    `;

    bodyTable.appendChild(row);

    // Asignar eventos a los nuevos inputs de la fila
    row.querySelector('.cantidad').addEventListener('input', calcular);
    row.querySelector('.precio').addEventListener('input', calcular);
    row.querySelector('.unidad').addEventListener('input', actualizarTablaPDF);
    row.querySelector('.descripcion').addEventListener('input', actualizarTablaPDF);
    
    row.querySelector('.eliminar').addEventListener('click', () => {
        row.remove();
        calcular();
    });

    calcular();
}

// ======================================
// CALCULAR TOTALES
// ======================================

function calcular() {
    let subtotal = 0;
    const filas = document.querySelectorAll('#bodyTable tr');

    filas.forEach(fila => {
        const cantidad = parseFloat(fila.querySelector('.cantidad').value) || 0;
        const precio = parseFloat(fila.querySelector('.precio').value) || 0;
        const importe = cantidad * precio;

        fila.querySelector('.importe').innerText = formatoMoneda(importe);
        subtotal += importe;
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    document.getElementById('subtotal').innerText = formatoMoneda(subtotal);
    document.getElementById('iva').innerText = formatoMoneda(iva);
    document.getElementById('total').innerText = formatoMoneda(total);

    actualizarTablaPDF();
    actualizarTotalesPDF();
}

// ======================================
// ACTUALIZAR DATOS GENERALES DEL PDF
// ======================================

function actualizarPDF() {
    document.getElementById('pdfCliente').textContent = cliente.value || '-';
    document.getElementById('pdfEmpresa').textContent = empresa.value || '-';
    document.getElementById('pdfProyecto').textContent = proyecto.value || '-';
    document.getElementById("pdfClienteCargo").textContent =cargo.value || "-";

    document.getElementById("pdfClienteRFC").textContent = rfcCliente.value || "-";
    document.getElementById("pdfClienteCorreo").textContent = email.value || "-";
    document.getElementById("pdfClienteTelefono").textContent = telefono.value || "-";
    document.getElementById("pdfClienteDireccion").textContent = direccion.value || "-";
    document.getElementById("pdfServicio").textContent = servicio.value || "-";
    document.getElementById("pdfUbicacion").textContent = ubicacion.value || "-";
    document.getElementById("pdfDuracion").textContent = duracion.value || "-";
    document.getElementById("pdfResponsable").textContent = responsable.value || "-";

    if (fecha.value) {
        const f = new Date(fecha.value);
        // Ajuste para evitar desfase de zona horaria al crear el Date
        f.setMinutes(f.getMinutes() + f.getTimezoneOffset());
        
        document.getElementById('pdfFecha').textContent = f.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } else {
        document.getElementById('pdfFecha').textContent = '-';
    }
}

// ======================================
// ACTUALIZAR TABLAS DEL PDF (RESUMEN Y ANEXO)
// ======================================

function actualizarTablaPDF() {
    const resumen = document.getElementById("pdfResumenPartidas");
    const anexo = document.getElementById("pdfAnexoConceptos");

    resumen.innerHTML = "";
    anexo.innerHTML = "";

    const partidas = {};
    const filas = document.querySelectorAll("#bodyTable tr");

    filas.forEach(fila => {
        const cantidad = parseFloat(fila.querySelector(".cantidad").value) || 0;
        const unidad = fila.querySelector(".unidad").value || "-";
        const descripcion = fila.querySelector(".descripcion").value || "-";
        const precio = parseFloat(fila.querySelector(".precio").value) || 0;
        const importe = cantidad * precio;

        // Anexo Técnico
        anexo.innerHTML += `
            <tr>
                <td class="align-center">${cantidad}</td>
                <td class="align-center">${unidad}</td>
                <td>${descripcion}</td>
                <td class="align-right">${formatoMoneda(precio)}</td>
                <td class="align-right">${formatoMoneda(importe)}</td>
            </tr>
        `;

        // Agrupación para Resumen Ejecutivo
        let categoria = obtenerCategoria(descripcion);
        partidas[categoria] = (partidas[categoria] || 0) + importe;
    });

    // Imprimir Resumen Ejecutivo
    for (let categoria in partidas) {
        resumen.innerHTML += `
            <tr>
                <td class="item-desc">${categoria}</td>
                <td class="align-right">${formatoMoneda(partidas[categoria])}</td>
            </tr>
        `;
    }
}

function obtenerCategoria(descripcion) {
    descripcion = descripcion.toLowerCase();

    if(descripcion.includes("yeso")) return "Albañilería y Acabados";
    if(descripcion.includes("pintura")) return "Pintura";
    if(descripcion.includes("carpinter")) return "Carpintería";
    if(descripcion.includes("impermeabil")) return "Impermeabilización";
    if(descripcion.includes("ventana") || descripcion.includes("aluminio")) return "Cancelería y Ventanas";
    if(descripcion.includes("piso")) return "Pisos y Recubrimientos";
    if(descripcion.includes("responsiva"))return "Servicios Profesionales y Trámites";
    if(descripcion.includes("licencia"))return "Servicios Profesionales y Trámites";return "Trabajos complementarios";
}

// ======================================
// ACTUALIZAR TOTALES DEL PDF
// ======================================

function actualizarTotalesPDF() {
    document.getElementById('pdfSubtotal').textContent = document.getElementById('subtotal').textContent;
    document.getElementById('pdfIVA').textContent = document.getElementById('iva').textContent;
    document.getElementById('pdfTotal').textContent = document.getElementById('total').textContent;

}

// ======================================
// FORMATEAR MONEDA
// ======================================

function formatoMoneda(numero) {
    return numero.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });
}

// ======================================
// GESTIÓN DE FOLIOS
// ======================================

function generarFolio() {
    const year = new Date().getFullYear();
    const yearGuardado = localStorage.getItem("rocaYear");

    // Si cambiamos de año, reiniciamos el consecutivo
    if(yearGuardado != year) {
        localStorage.setItem("rocaYear", year);
        localStorage.setItem("rocaConsecutivo", 1);
    }

    let consecutivo = parseInt(localStorage.getItem("rocaConsecutivo")) || 1;
    const folio = `ROCA-${year}-${String(consecutivo).padStart(3, "0")}`;
    
    document.getElementById("pdfFolio").textContent = folio;
    document.getElementById("pdfFolioAnexo").textContent = folio;
    document.getElementById("pageNumber1").textContent =`${folio} · Página 1 de 2`;
    document.getElementById("pageNumber2").textContent =`${folio} · Página 2 de 2`;
}

function guardarSiguienteFolio() {
    let consecutivo = parseInt(localStorage.getItem("rocaConsecutivo")) || 1;
    consecutivo++;
    localStorage.setItem("rocaConsecutivo", consecutivo);
}

// Función auxiliar en caso de que necesites resetear el contador desde consola
function resetFolios() {
    localStorage.removeItem("rocaConsecutivo");
    localStorage.removeItem("rocaYear");
    generarFolio();
}

// ======================================
// DESCARGAR PDF
// ======================================

async function descargarPDF() {

    const folio =
        document.getElementById("pdfFolio")
        .textContent;

        

    const paginas = [
        document.getElementById("executiveProposal"),
        document.getElementById("technicalAnnex")
    ];

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    for (let i = 0; i < paginas.length; i++) {

        const canvas =
            await html2canvas(paginas[i], {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff"
            });

        const img =
            canvas.toDataURL(
                "image/jpeg",
                1
            );

        const width = 210;
        const height =
            (canvas.height * width)
            / canvas.width;

        if (i > 0) {
            pdf.addPage();
        }

        pdf.addImage(
            img,
            "JPEG",
            0,
            0,
            width,
            height
        );

        // ← AQUÍ VA EL NÚMERO DE PÁGINA
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
pdf.setTextColor(120);

pdf.setFont("helvetica", "normal");
pdf.setFontSize(7);
pdf.setTextColor(130);

if (i === 0) {
    pdf.text(
        `Página 1 de ${paginas.length}`,
        200,
        294,
        {
            align: "right"
        }
    );
} else {
    pdf.text(
        `${folio} · Página ${i + 1} de ${paginas.length}`,
        200,
        294,
        {
            align: "right"
        }
    );
}
    }

    pdf.save(`${folio}.pdf`);
}

// ======================================
// CARGAR DATOS DEMO
// ======================================

function cargarConceptosDemo() {
    const conceptos = [
        { descripcion: `YES-0001 - Corrección, resane y afinado de muros.`, unidad: "M2", cantidad: 1150, precio: 160 },
        { descripcion: `YES-0002 - Aplicación de yeso en boquilla.`, unidad: "ML", cantidad: 60, precio: 80 },
        { descripcion: `Suministro y aplicación de estuco en muro exterior.`, unidad: "M2", cantidad: 544, precio: 95 },
        { descripcion: `Pintura acrílica interior Berh Premium Plus.`, unidad: "PZA", cantidad: 9, precio: 3399 },
        { descripcion: `Aplicación de pintura acrílica interior a dos manos.`, unidad: "M2", cantidad: 1150, precio: 30 },
        { descripcion: `Pintura acrílica exterior Berh Premium Plus.`, unidad: "PZA", cantidad: 6, precio: 3599 },
        { descripcion: `Aplicación de pintura acrílica exterior a dos manos.`, unidad: "M2", cantidad: 544, precio: 30 },
        { descripcion: `Carpintería: cocina integral, puertas, muebles.`, unidad: "LOTE", cantidad: 1, precio: 590000 },
        { descripcion: `Sistema de impermeabilización acrílico Fester 8 años.`, unidad: "LOTE", cantidad: 1, precio: 35235 },
        { descripcion: `Suministro de ventanas de aluminio.`, unidad: "LOTE", cantidad: 1, precio: 40000 },
        { descripcion: `Piso de ingeniería para terraza nivel 1.`, unidad: "M2", cantidad: 18, precio: 3500 },
        { descripcion: `Trabajos diversos de terminación de obra.`, unidad: "LOTE", cantidad: 1, precio: 55000 },
        { descripcion: `Servicios de responsiva de director responsable.`, unidad: "SERVICIO", cantidad: 1, precio: 36000 },
        { descripcion: `Gestión, actualización y regularización de licencia de construcción, incluyendo derechos y pagos municipales correspondientes.`, unidad: "SERVICIO", cantidad: 1, precio: 45000 }
    ];

    bodyTable.innerHTML = "";

    conceptos.forEach(item => {
        agregarFila();
        const ultimaFila = bodyTable.lastElementChild;
        ultimaFila.querySelector(".cantidad").value = item.cantidad;
        ultimaFila.querySelector(".unidad").value = item.unidad;
        ultimaFila.querySelector(".descripcion").value = item.descripcion;
        ultimaFila.querySelector(".precio").value = item.precio;
    });

    calcular();
}

// ======================================
// INICIALIZACIÓN
// ======================================

generarFolio();
actualizarPDF();
cargarConceptosDemo(); // Esta función ya llama a calcular() y actualizarTablaPDF()