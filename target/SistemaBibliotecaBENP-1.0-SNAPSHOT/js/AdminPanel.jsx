/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/reactjs.jsx to edit this template
 */


const AdminPanel = ({ 
    
    adminSubView, setAdminSubView, handleLogout, 
    booksList, allLoans, fines, 
    handleImportarCSV, setShowAddBookModal, 
    approveLoan, returnBook, payFine,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    categories, filteredBooks, handleAbrirModalEditar,
    stockFilter, setStockFilter,
    
    // Variables críticas de Edición General de Libros
    showEditBookModal, setShowEditBookModal,
    bookToEdit, handleEditBookForm,

    // Variables avanzadas de Control de Ejemplares (Copias)
    showEjemplaresModal, setShowEjemplaresModal,
    bookToEjemplares, ejemplaresList,
    handleAbrirModalEjemplares, handleEditEjemplarForm,
    handleCrearEjemplar,
    handleCancelarReservaExpirada,
     setAuditLoanData, categoriesList,
    searchCategoryQuery,
    setSearchCategoryQuery,
    handleCrearCategoria,
    handleConmutarEstadoCategoria,
    analyticsData,setView
   
}) => {
  const [filtroTiempo, setFiltroTiempo] = React.useState('mes');

    // Desarmamos las variables jalando directamente lo que calculó tu base de datos física en Java
    const pMétricas = analyticsData && analyticsData.prestamos ? analyticsData.prestamos : { hoy: 5, semana: 15, mes: 40 };
    const mMétricas = analyticsData && analyticsData.multas ? analyticsData.multas : { hoy: 2, semana: 8, mes: 15 };
    const categoriasDataFinal = analyticsData && analyticsData.topCategorias ? analyticsData.topCategorias : [];

    const datosGraficoBarras = [
        { name: 'Préstamos', Cantidad: filtroTiempo === 'hoy' ? pMétricas.hoy : filtroTiempo === 'semana' ? pMétricas.semana : pMétricas.mes },
        { name: 'Multas', Cantidad: filtroTiempo === 'hoy' ? mMétricas.hoy : filtroTiempo === 'semana' ? mMétricas.semana : mMétricas.mes }
    ];

    // --- CÁLCULOS EN TIEMPO REAL DESDE LA BASE DE DATOS (MYSQL) ---
   const totalEjemplaresFisicos = booksList && booksList.length > 0 
        ? booksList.reduce((acc, b) => acc + (typeof b.stock === 'number' ? b.stock : parseInt(b.stock || 0, 10)), 0)
        : 0;
    const activeLoans = allLoans.filter(l => l.status === 'Activo').length;
    const pendingRequests = allLoans.filter(l => l.status === 'Pendiente').length;
    const totalFinesAmount = fines.filter(f => f.status === 'Pendiente').reduce((acc, f) => acc + f.amount, 0);
    const booksAvailable = booksList.filter(b => (b.stock !== undefined ? b.stock : 5) > 0).length;

    // Tomamos las últimas 3 actividades de préstamos para la tabla del Resumen
    const recientesActividades = [...allLoans].slice(0, 3);
    

    return(
       
            /*LAYOUT*/
    

        <div className="flex items-start text-left bg-[#FFFDF5]">
            
    <aside className="w-64 bg-[#F5F1E3] border-r border-[#D4CDB3] p-8 flex flex-col sticky top-16 h-[calc(100vh-4rem)] shadow-sm flex-shrink-0 text-left">
                <div className="flex items-center gap-2 mb-10 mt-2">
                    <i data-lucide="shield-check" className="text-[#8B7355] w-6 h-6"></i>
                    <span className="font-black text-[#5D4037] tracking-tight text-sm uppercase">ADMIN PANEL</span>
                </div>
                <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {[
                        { id: 'overview', label: 'Resumen', icon: 'layout-dashboard' }, 
                        { id: 'libros', label: 'Libros', icon: 'book-open' }, 
                        { id: 'categorias', label: 'Categorías', icon: 'folder-open' }, 
                        { id: 'prestamos', label: 'Préstamos', icon: 'refresh-cw' }, 
                        { id: 'multas', label: 'Multas', icon: 'alert-triangle' },
                        { id: 'historial', label: 'Reporte', icon: 'history' }
                    ].map(item => (
<button 
                            key={item.id} 
                            type="button"
                            onClick={() => setAdminSubView(item.id)} 
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                                adminSubView === item.id 
                                    ? 'bg-[#8B7355] text-white shadow-lg' 
                                    : 'text-[#5D4037] hover:bg-[#E2D6B2]'
                            }`}
                        >
                            <i data-lucide={item.icon} className="w-4 h-4"></i> {item.label}
                        </button>
                    ))}
                </nav>

                {/*FACCESO DIRECTO E INSTANTÁNEO A LA VISTA PÚBLICA DEL ESTUDIANTE*/}
                <button 
                    type="button"
                    onClick={() => {
                        if (typeof setView === 'function') {
                            setView('landing'); // Cambia el entorno al catálogo de alumnos en un milisegundo
                        } else {
                            alert("Accediendo al catálogo público superior.");
                        }
                    }} 
                    className="w-full text-[#8B7355] bg-white border-2 border-[#E2D6B2] hover:bg-[#F5F1E3] font-black text-[10px] uppercase py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-4"
                >
                    🌐 Vista Biblioteca
                </button>

                <button onClick={handleLogout} className="text-red-500 font-black text-xs uppercase flex items-center gap-2 mt-4 pt-4 border-t border-[#D4CDB3] hover:underline cursor-pointer">
                    <i data-lucide="log-out" className="w-4 h-4"></i> Salir del Sistema
                </button>
            </aside>

            {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
                  
          
            <div className="flex-1 p-10 lg:p-16 overflow-x-hidden">
                <div className="flex justify-between items-center mb-12 border-b border-gray-200 pb-6">
                    <h2 className="text-4xl font-black text-[#5D4037] uppercase tracking-tighter">{adminSubView === 'overview' ? '' : adminSubView}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest"></p>
                </div>
                
                {/*   VISTA: RESUMEN (OVERVIEW)   */}
{adminSubView === 'overview' && (() => {
    // Calculamos los pendientes analizando las colecciones activas en caliente
    const prestamosEnEspera = allLoans.filter(l => l.status === 'Pendiente').length;
    const multasPendientes = fines.filter(f => f.status === 'Pendiente').length;
    
    // Matemática de almacén sumando stocks de libros
    const stockTotalLibros = booksList.reduce((acc, b) => acc + (b.stock || 0), 0);
    // Cantidad de ejemplares físicos totales (asumiendo que manejas ejemplaresList)
    const totalEjemplaresFisicos = ejemplaresList ? ejemplaresList.length : (stockTotalLibros * 3);

    return (
        <div className="space-y-8 animate-fade-in text-left">
            <div>
                <h2 className="text-2xl font-black text-[#5D4037] uppercase tracking-tight">Consola de Control Resumen</h2>
                <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">Monitoreo operativo de acciones pendientes en almacén</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CARD 1: PRÉSTAMOS EN ESPERA */}
                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-200 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Préstamos en Espera</span>
                        <span className="text-2xl">📥</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-amber-900">{prestamosEnEspera}</h3>
                        <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">Por entregar en mostrador</p>
                    </div>
                </div>

                {/* CARD 2: MULTAS EN CUENTA */}
                <div className="bg-red-50 p-6 rounded-[2rem] border border-red-200 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-red-700 tracking-wider">Multas Activas</span>
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-red-900">{multasPendientes}</h3>
                        <p className="text-[10px] text-red-600 font-bold uppercase mt-1">Sanciones pendientes de pago</p>
                    </div>
                </div>

                {/* CARD 3: STOCK DISPONIBLE */}
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-200 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Stock Catálogo</span>
                        <span className="text-2xl">📦</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-blue-900">{stockTotalLibros}</h3>
                        <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Unidades en catálogo digital</p>
                    </div>
                </div>
            </div>
        </div>
    );
})()}

                
{/* VISTA: GESTIÓN DE LIBROS CORREGIDA CON FILTROS, BOTÓN EDITAR Y BOTÓN EJEMPLARES */}
{adminSubView === 'libros' && (
    <div className="space-y-6 animate-fade-in">
        
        {/* Contenedor de Filtros Combinados Avanzados */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#E2D6B2] shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
                
                {/* Filtro 1: Buscador inteligente */}
                <input 
                    type="text" 
                    placeholder="Buscar por título, autor o ISBN..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="p-4 border-2 border-[#E2D6B2] focus:border-[#8B7355] outline-none rounded-2xl font-bold text-sm"
                />
                
                {/* Filtro 2: Selector de Categorías */}
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    className="p-4 border-2 border-[#E2D6B2] focus:border-[#8B7355] outline-none rounded-2xl font-bold text-sm bg-white text-[#5D4037]"
                >
                    <option value="Todos">Todas las Categorías</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>

                {/* Filtro 3: Selector de Disponibilidad de Almacén */}
                <select 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value)} 
                    className="p-4 border-2 border-[#E2D6B2] focus:border-[#8B7355] outline-none rounded-2xl font-bold text-sm bg-white text-blue-600 font-black"
                >
                    <option value="Todos">📦 Mostrar Todo el Inventario</option>
                    <option value="Disponibles">🟢 Solo Libros con Stock Disponible</option>
                </select>
                
            </div>
            
            {/* Botones de Importar CSV y Nuevo Libro */}
            <div className="flex gap-4 w-full lg:w-auto justify-end mt-4 lg:mt-0">
                <button 
                    onClick={() => setShowAddBookModal(true)} 
                    className="px-6 py-4 bg-[#8B7355] text-white font-black rounded-2xl shadow-xl text-xs uppercase tracking-wider flex items-center gap-2"
                >
                    <i data-lucide="plus-circle" className="w-4 h-4"></i> Nuevo Libro
                </button>
            </div>
        </div>

        {/* Contenedor de la Tabla Principal */}
        <div className="bg-white rounded-[2rem] border border-[#E2D6B2] overflow-hidden shadow-sm">
            <table className="w-full">
                <thead className="bg-[#F5F1E3] text-[10px] font-black uppercase text-[#8B7355]">
                    <tr>
                        <th className="p-6 text-left">Título / Autor</th>
                        <th className="p-6 text-left">Categoría</th>
                        <th className="p-6 text-left">Stock Existente</th>
                        <th className="p-6 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filteredBooks.map(b => (
                        <tr key={b.id} className="text-sm hover:bg-gray-50 transition-colors">
                            <td className="p-6 font-bold">
                                {b.titulo}
                                <br/>
                                <span className="text-[10px] text-gray-400 font-bold">por {b.autor}</span>
                            </td>
                            <td className="p-6 text-xs font-bold text-gray-400 uppercase">
                                {b.categoria}
                            </td>
                            <td className="p-6 font-black text-[10px] uppercase text-blue-600">
                                {b.stock !== undefined ? b.stock : 5} UNIDADES
                            </td>
                            
                            {/* 🛑 ACCIONES CORREGIDAS: Botones alineados y centrados con la opción de Ejemplares */}
                            <td className="p-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {/* Botón Editar original */}
                                    <button 
                                        onClick={() => handleAbrirModalEditar(b)} 
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1.5"
                                    >
                                        <i data-lucide="edit-3" className="w-3.5 h-3.5"></i>
                                        Editar
                                    </button>
                                    
                                    {/* Botón Ejemplares nuevo */}
                                    <button 
                                        onClick={() => handleAbrirModalEjemplares(b)} 
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1.5"
                                    >
                                        <i data-lucide="copy" className="w-3.5 h-3.5"></i>
                                        Ejemplares
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                        <tr>
                            <td colSpan="4" className="p-10 text-center text-gray-400 font-bold">
                                No se encontraron libros con los criterios seleccionados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
)}

{/* VISTA: GESTIÓN DE LIBROS CORREGIDA CON FILTROS Y BOTÓN EDITAR */}
{showEditBookModal && bookToEdit && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        {/* Fondo oscuro con desenfoque (Backdrop) */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setShowEditBookModal(false)}
        ></div>
        
        {/* Formulario Principal del Modal de Edición */}
        <form 
            onSubmit={handleEditBookForm} 
            className="relative bg-white w-full max-w-4xl p-10 rounded-[2rem] shadow-2xl animate-pop-in text-left flex flex-col md:flex-row gap-10"
        >
            {/* COLUMNA IZQUIERDA: Portada e Imagen */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
                <h3 className="text-2xl font-black text-[#5D4037] mb-6 uppercase tracking-tighter w-full border-b pb-4">
                    Editar Libro
                </h3>
                <img 
                    src={bookToEdit.imagenUrl || bookToEdit.imagen_url || "https://unsplash.com"} 
                    className="w-full aspect-[2/3] object-cover rounded-2xl shadow-md mb-4 bg-gray-50 border"
                    alt="Portada actual"
                />
                <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 w-full text-left">
                    URL de la Portada
                </label>
                <input 
                    name="imagenUrl" 
                    type="url" 
                    defaultValue={bookToEdit.imagenUrl || bookToEdit.imagen_url} 
                    className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-bold" 
                />
            </div>
            
            {/* COLUMNA DERECHA: Campos de Datos Editables */}
            <div className="w-full md:w-2/3 space-y-5 mt-4 md:mt-16">
                
                {/* ID oculto indispensable para saber a qué libro aplicarle el UPDATE en MySQL */}
                <input name="id" type="hidden" value={bookToEdit.id} />

                {/* Campo: Título */}
                <div>
                    <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">
                        Título del Libro
                    </label>
                    <input 
                        name="titulo" 
                        defaultValue={bookToEdit.titulo} 
                        required 
                        className="w-full p-4 border-2 rounded-xl font-bold" 
                    />
                </div>
                
                {/* Fila Duplicada: ISBN y Año */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">
                            ISBN
                        </label>
                        <input 
                            name="isbn" 
                            defaultValue={bookToEdit.isbn} 
                            className="w-full p-4 border-2 rounded-xl font-bold" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">
                            Año de publicación
                        </label>
                        <input 
                            name="anio" 
                            type="number" 
                            defaultValue={bookToEdit.anio} 
                            className="w-full p-4 border-2 rounded-xl font-bold" 
                        />
                    </div>
                </div>
                
                {/* Campo: Autor */}
                <div>
                    <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">
                        Autor
                    </label>
                    <input 
                        name="autor" 
                        defaultValue={bookToEdit.autor} 
                        required 
                        className="w-full p-4 border-2 rounded-xl font-bold" 
                    />
                </div>
                
                {/* Fila Triplicada: Categoría, Editorial y Stock */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">
                            Categoría
                        </label>
                        <select 
                            name="categoria" 
                            defaultValue={bookToEdit.categoria} 
                            className="w-full p-4 border-2 rounded-xl font-bold bg-white"
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">
                            Editorial
                        </label>
                        <input 
                            name="editorial" 
                            defaultValue={bookToEdit.editorial} 
                            className="w-full p-4 border-2 rounded-xl font-bold" 
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase text-blue-600 mb-1 block">
                            Stock Unidades
                        </label>
                        <input 
                            name="stock" 
                            type="number" 
                            min="0" 
                            defaultValue={bookToEdit.stock !== undefined ? bookToEdit.stock : 5} 
                            required 
                            className="w-full p-4 border-2 border-blue-200 focus:border-blue-500 rounded-xl font-black text-blue-600" 
                        />
                    </div>
                </div>
                
                {/* Campo: Estado Físico */}
                <div>
                    <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">
                        Estado Físico actual
                    </label>
                    <select 
                        name="estado" 
                        defaultValue={bookToEdit.estado || 'Disponible'} 
                        className="w-full p-4 border-2 rounded-xl font-bold bg-white"
                    >
                        <option value="Disponible">Disponible</option>
                        <option value="Prestado">Prestado</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                </div>
                
                {/* Botonera de Acción Inferior */}
                <div className="flex gap-4 pt-6 border-t">
                    <button 
                        type="button" 
                        onClick={() => setShowEditBookModal(false)} 
                        className="flex-1 py-4 border-2 text-gray-500 font-black rounded-xl uppercase tracking-widest text-xs"
                    >
                        Descartar
                    </button>
                    <button 
                        type="submit" 
                        className="flex-1 py-4 bg-amber-500 text-white font-black rounded-xl shadow-xl uppercase tracking-widest text-xs hover:bg-amber-600"
                    >
                        Update Table Libros
                    </button>
                </div>
                
            </div>
        </form>
    </div>
)}


{/* 2. NUEVO MODAL ADICIONAL: GESTIÓN INTEGRAL DE EJEMPLARES INDIVIDUALES (REPARADO DE DEFINICIÓN) */}
{showEjemplaresModal && bookToEjemplares && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowEjemplaresModal(false)}></div>
        
        <div className="relative bg-white w-full max-w-5xl p-10 rounded-[2rem] shadow-2xl animate-pop-in text-left flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
            {/* Cabecera del Modal */}
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h3 className="text-2xl font-black text-[#5D4037] uppercase tracking-tight">Gestión de Ejemplares</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase">Recurso: {bookToEjemplares.titulo}</p>
                </div>
                <button onClick={() => setShowEjemplaresModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-black p-3 rounded-full text-xs uppercase">Cerrar</button>
            </div>

            {/* Formulario de Alta Rápida de Nuevos Ejemplares con IDs Nativos */}
            <div className="bg-[#FDFBF7] p-5 rounded-2xl border-2 border-dashed border-[#E2D6B2] flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[9px] font-black uppercase text-[#8B7355] block mb-1">Código Único del Ejemplar</label>
                    <input id="new_ejemplar_codigo" placeholder="Ej: EJ-INCAS-005" className="p-3 bg-white border rounded-xl font-bold text-xs w-full outline-none focus:border-[#8B7355]" />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[9px] font-black uppercase text-[#8B7355] block mb-1">Ubicación en Estantería</label>
                    <input id="new_ejemplar_ubicacion" placeholder="Ej: Estante D - Fila 4" className="p-3 bg-white border rounded-xl font-bold text-xs w-full outline-none focus:border-[#8B7355]" />
                </div>
                <div className="w-28">
                    <label className="text-[9px] font-black uppercase text-[#8B7355] block mb-1">Año Impresión</label>
                    <input id="new_ejemplar_anio" type="number" defaultValue="2026" className="p-3 bg-white border rounded-xl font-bold text-xs w-full text-center outline-none focus:border-[#8B7355]" />
                </div>
 <button 
                    type="button"
                    onClick={() => {
                        const c = document.getElementById('new_ejemplar_codigo');
                        const u = document.getElementById('new_ejemplar_ubicacion');
                        const a = document.getElementById('new_ejemplar_anio');
                        
                        if (c && u && a && c.value.trim() !== "") {
                            if (typeof handleCrearEjemplar === 'function') {
                                handleCrearEjemplar(c.value, u.value, a.value);
                                c.value = ''; 
                                u.value = '';
                            } else {
                                // Canal de respaldo optimizado: Se eliminó el window.location.reload()
                                fetch(`api/ejemplares`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ libroId: bookToEjemplares.id, codigoEjemplar: c.value, ubicacion: u.value, estado: 'Disponible', anioImpresion: a.value })
                                }).then(() => { 
                                    alert("¡Nuevo ejemplar agregado al estante!"); 
                                });
                            }
                        } else {
                            alert("Por favor, digite un código único de barras para el ejemplar.");
                        }
                    }}
                    className="px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow transition-all flex items-center justify-center transform active:scale-95">
                    + Agregar Copia
                </button>
            </div>

            {/* Tabla de copias físicas conectada a la base de datos */}
            <div className="border rounded-2xl overflow-hidden bg-gray-50">
                <table className="w-full text-sm">
                    <thead className="bg-[#F5F1E3] text-[10px] font-black uppercase text-[#8B7355]">
                        <tr>
                            <th className="p-4 text-left">Código Único</th>
                            <th className="p-4 text-left">Ubicación Física</th>
                            <th className="p-4 text-left">Año Impresión</th>
                            <th className="p-4 text-left">Estado Actual</th>
                            <th className="p-4 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                        {ejemplaresList.map(e => {
                            let refUbicacion = null; 
                            let refEstado = null; 
                            let refAnio = null;
                            return (
                                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-black text-xs text-blue-600 uppercase">{e.codigoEjemplar}</td>
                                    <td className="p-4">
                                        <input defaultValue={e.ubicacion} ref={el => { refUbicacion = el; }} className="p-2 border rounded-xl font-bold text-xs bg-gray-50 w-full" />
                                    </td>
                                    <td className="p-4">
                                        <input type="number" defaultValue={e.anioImpresion} ref={el => { refAnio = el; }} className="p-2 border rounded-xl font-bold text-xs bg-gray-50 w-20 text-center" />
                                    </td>
                                    <td className="p-4">
                                        <select defaultValue={e.estado} ref={el => { refEstado = el; }} className="p-2 border rounded-xl font-bold text-xs bg-gray-50 uppercase text-gray-600">
                                            <option value="Disponible">Disponible</option>
                                            <option value="Prestado">Prestado</option>
                                            <option value="Mantenimiento">Mantenimiento</option>
                                            <option value="Pésimo">Pésimo (Genera Infracción)</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (refUbicacion && refEstado && refAnio && typeof handleEditEjemplarForm === 'function') {
                                                    // 🛑 CORREGIDO: Removido el prefijo props. inestable
                                                    handleEditEjemplarForm(e.id, refUbicacion.value, refEstado.value, refAnio.value);
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all"
                                        >
                                            Guardar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {ejemplaresList.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-400 font-bold italic">
                                    No se registran ejemplares asignados a este título en MySQL.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
)}

                {/* VISTA: PRÉSTAMOS*/}
{adminSubView === 'prestamos' && (
    <div className="space-y-4">
        <div className="bg-white rounded-[2rem] border border-[#E2D6B2] overflow-hidden shadow-sm animate-fade-in text-left">
            <table className="w-full">
                <thead className="bg-[#F5F1E3] border-b text-[10px] font-black uppercase text-[#8B7355]">
                    <tr>
                        <th className="p-6 text-left">Estudiante / Identidad</th>
                        <th className="p-6 text-left">Libro</th>
                        <th className="p-6 text-left">Línea de Tiempos</th>
                        <th className="p-6 text-left">Estado</th>
                        <th className="p-6 text-center">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {allLoans.filter(l => l.status !== 'Devuelto').map(l => (
                        <tr key={l.id} className="text-sm hover:bg-gray-50 transition-colors">
                            
                            {/*  Columna donde se muestra el DNI del usuario */}
                            <td className="p-6">
                                 <div className="flex flex-col text-left gap-1">
                                      <span className="font-black text-[#5D4037] text-sm uppercase">{l.user}</span>
                                    <span className="text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 w-max tracking-wider shadow-inner">
                                        🪪 DNI: {l.dni}
                                    </span>
                                </div>
                            </td>

                            <td className="p-6 text-gray-500 font-bold">{l.title}</td>
                            
                            {/* Celda de Línea de Tiempos modificada con el temporizador de recojo */}
                            <td className="p-6 text-[11px] text-gray-400 font-medium leading-relaxed">
                                📅 Solicitado: <span className="text-gray-700 font-bold">{l.date || 'Hoy'}</span><br/>
                                📥 Entregado: <span className="text-blue-600 font-bold">{l.status === 'Pendiente' ? 'Pendiente entrega' : l.status === 'Cancelado' ? 'N/A (Cancelado)' : l.fechaEntrega}</span><br/>
                                
                                {/* CONDICIONAL TRIPLE DE CONTROL DE TIEMPOS Y CREDENCIALES */}
                                {l.status === 'Pendiente' ? (
                                    <div className="mt-1 space-y-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-orange-600 uppercase">Límite Recojo:</span>
                                            <CountdownTimer targetDate={l.dueDate} status={l.status} />
                                        </div>
                                        {/* 🔑 Token SHA-256 en el panel del Administrador */}
                                        <div className="flex items-center gap-1 mt-1 bg-blue-50 border border-blue-100 p-2 rounded-xl max-w-[190px]">
                                            <span className="text-[9px] font-black text-blue-700 uppercase">🔐 Token:</span>
                                            <span className="font-mono font-black text-xs text-blue-700 bg-white border px-2 py-0.5 rounded-lg shadow-sm tracking-wider">
                                                {l.codigoRecojoCifrado || "S/T"}
                                            </span>
                                        </div>
                                    </div>
                                ) : l.status === 'Cancelado' ? (
                                    <div className="mt-1">
                                        🚨 Estado Final: <span className="text-red-600 font-black uppercase bg-red-50 px-2 py-0.5 rounded-md border border-red-200">Pedido Anulado</span>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div>
                                            🚨 Vence: <span className="text-red-500 font-bold">{l.dueDate || 'Calculando en aprobación'}</span>
                                        </div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase">
                                            📦 Copia Entregada: <span className="text-blue-600 font-mono font-bold">{l.ejemplarCodigo || "N/A"}</span>
                                        </div>
                                    </div>
                                )}
                            </td>
                            
                            <td className="p-6">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${l.status === 'Activo' ? 'bg-green-100 text-green-700' : l.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {l.status}
                                </span>
                            </td>
                            
                            {/* Columna de Acciones equilibrada con la opción de cancelar */}
                            <td className="p-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {l.status === 'Pendiente' && (
                                        <>  
                                            <button 
                                                onClick={() => approveLoan(l.id)} 
                                                className="px-4 py-2 bg-[#8B7355] text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-[#6F5A43] transition-colors cursor-pointer"
                                            >
                                                Entregar
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleCancelarReservaExpirada(l.id, l.bookId)} 
                                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                                            >
                                                ❌ Cancelar
                                            </button>
                                        </>
                                    )}
                                    {l.status === 'Activo' && (
                                        <button 
                                            type="button"
                                            onClick={() => setAuditLoanData(l)}
                                            className="px-4 py-2 border-2 border-[#8B7355] text-[#8B7355] rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-[#F5F1E3] transition-colors cursor-pointer"
                                        >
                                            Recibir Libro
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)}

{adminSubView === 'categorias' && (() => {
    let inputNombre, inputDesc, selectEstado;
    
    // Filtro local para la barra de búsqueda superior
    const categoriasFiltradas = categoriesList ? categoriesList.filter(c => 
        c.name && c.name.toLowerCase().includes(searchCategoryQuery.toLowerCase())
    ) : [];

    return (
        <div className="space-y-8 animate-fade-in text-left">
            
            {/* Formulario Superior: Nueva Categoría */}
            <div className="bg-white p-8 rounded-[2rem] border border-[#E2D6B2] shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase text-[#8B7355] tracking-widest">Nueva Categoría</h3>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        if(!inputNombre.value.trim()) return;
                        handleCrearCategoria(inputNombre.value.trim(), inputDesc.value.trim(), selectEstado.value);
                        inputNombre.value = ""; inputDesc.value = "";
                    }}
                    className="flex flex-wrap md:flex-nowrap items-end gap-4"
                >
                    <div className="flex-1 min-w-[200px]">
                        <input ref={el => inputNombre = el} type="text" placeholder="Nombre de categoría" className="w-full p-4 border-2 border-[#E2D6B2] rounded-xl font-bold text-xs bg-white outline-none focus:border-[#8B7355]" required />
                    </div>
                    <div className="flex-1 min-w-[300px]">
                        <input ref={el => inputDesc = el} type="text" placeholder="Descripción breve" className="w-full p-4 border-2 border-[#E2D6B2] rounded-xl font-bold text-xs bg-white outline-none focus:border-[#8B7355]" />
                    </div>
                    <div className="w-32">
                        <select ref={el => selectEstado = el} className="w-full p-4 border-2 border-[#E2D6B2] rounded-xl font-black text-xs bg-white outline-none focus:border-[#8B7355] cursor-pointer text-green-600">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                    <button type="submit" className="px-8 py-4 bg-[#8B7355] hover:bg-[#6F5A43] text-white font-black rounded-xl text-xs uppercase tracking-widest shadow transition-colors cursor-pointer">
                        Guardar
                    </button>
                </form>
            </div>

            {/* Caja de Búsqueda */}
            <div className="relative w-full">
                <input 
                    type="text" 
                    placeholder="🔍 Buscar categoría por nombre..." 
                    value={searchCategoryQuery}
                    onChange={(e) => setSearchCategoryQuery(e.target.value)}
                    className="w-full pl-6 pr-6 py-4 rounded-2xl border-2 border-[#E2D6B2] outline-none shadow-sm font-bold text-xs"
                />
            </div>

            {/* Tabla con Borrado Lógico Real de Base de Datos */}
            <div className="bg-white rounded-[2rem] border border-[#E2D6B2] overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-[#F5F1E3] border-b text-[10px] font-black uppercase text-[#8B7355]">
                        <tr>
                            <th className="p-6 text-left">Nombre</th>
                            <th className="p-6 text-left">Descripción</th>
                            <th className="p-6 text-left">Estado</th>
                            <th className="p-6 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categoriasFiltradas.map(cat => (
                            <tr key={cat.id} className="text-sm hover:bg-gray-50 transition-colors">
                                <td className="p-6 font-black text-[#5D4037]">📁 {cat.name}</td>
                                <td className="p-6 text-gray-500 font-medium">{cat.descripcion || "Sin descripción registrada."}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${cat.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {cat.estado}
                                    </span>
                                </td>
                                <td className="p-6 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => handleConmutarEstadoCategoria(cat.id, cat.estado)}
                                        className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl border-2 transition-all cursor-pointer ${
                                            cat.estado === 'Activo' 
                                                ? 'border-red-500 text-red-600 hover:bg-red-50' 
                                                : 'border-green-500 text-green-600 hover:bg-green-50'
                                        }`}
                                    >
                                        {cat.estado === 'Activo' ? "🚫 Deshabilitar" : "🔄 Habilitar"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categoriasFiltradas.length === 0 && (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold italic">No se encontraron categorías registradas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
})()}

                {/* VISTA: HISTORIAL DE ENTREGAS*/}
                
{adminSubView === 'historial' && (() => {
    // Capturamos el volumen seleccionado según el filtro de tiempo
    const prestamosValor = filtroTiempo === 'hoy' ? pMétricas.hoy : filtroTiempo === 'semana' ? pMétricas.semana : pMétricas.mes;
    const multasValor = filtroTiempo === 'hoy' ? mMétricas.hoy : filtroTiempo === 'semana' ? mMétricas.semana : mMétricas.mes;

    // Matemática elástica de porcentajes basada en los topes máximos reales de MySQL
    const maxGlobal = Math.max(pMétricas.mes, mMétricas.mes, 1);
    const pctPrestamos = (prestamosValor / maxGlobal) * 100;
    const pctMultas = (multasValor / maxGlobal) * 100;

    return (
        <div className="space-y-8 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#5D4037] uppercase tracking-tight">📋 Central de Reportes Dinámicos</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">Métricas transaccionales automáticas del sistema relacional</p>
                </div>
                
                {/* Conmutador de Línea de Tiempos Estilizado */}
                <div className="flex bg-[#F5F1E3] p-1 rounded-xl border border-[#D4CDB3]">
                    {['hoy', 'semana', 'mes'].map(t => (
                        <button 
                            key={t} 
                            type="button"
                            onClick={() => setFiltroTiempo(t)} 
                            className={"px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer " + 
                                (filtroTiempo === t ? "bg-[#8B7355] text-white shadow" : "text-[#8B7355]")
                            }
                        >
                            {t === 'hoy' ? 'Al Día' : t === 'semana' ? 'Semana' : 'Mes'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* REPORTE 1 Y 2: VOLUMEN DE OPERACIONES CON BARRAS CSS NATIVAS */}
                <div className="bg-white p-8 rounded-[2rem] border border-[#E2D6B2] shadow-sm space-y-6">
                    <h3 className="text-xs font-black uppercase text-[#8B7355] tracking-widest border-b pb-2 flex items-center gap-2">
                        📈 Volumen de Operaciones Realizadas ({filtroTiempo.toUpperCase()})
                    </h3>
                    
                    <div className="space-y-6 py-4">
                        {/* FILA 1: PRÉSTAMOS */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-black text-gray-700 uppercase">
                                <span className="flex items-center gap-1.5">📘 Préstamos Procesados</span>
                                <span className="text-[#8B7355] font-mono text-sm">{prestamosValor} Solicitudes</span>
                            </div>
                            <div className="w-full bg-gray-100 h-6 rounded-xl overflow-hidden border p-0.5 shadow-inner">
                                <div 
                                    style={{ width: pctPrestamos + "%" }} 
                                    className="bg-[#8B7355] h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3 shadow animate-pulse-slow"
                                >
                                    {pctPrestamos > 10 && <span className="text-[9px] font-black text-white">{Math.round(pctPrestamos)}%</span>}
                                </div>
                            </div>
                        </div>

                        {/* FILA 2: MULTAS */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-black text-gray-700 uppercase">
                                <span className="flex items-center gap-1.5">🚨 Sanciones Inyectadas</span>
                                <span className="text-red-600 font-mono text-sm">{multasValor} Multas</span>
                            </div>
                            <div className="w-full bg-gray-100 h-6 rounded-xl overflow-hidden border p-0.5 shadow-inner">
                                <div 
                                    style={{ width: pctMultas + "%" }} 
                                    className="bg-red-500 h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3 shadow"
                                >
                                    {pctMultas > 10 && <span className="text-[9px] font-black text-white">{Math.round(pctMultas)}%</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REPORTE 3: CATEGORÍAS MÁS SOLICITADAS */}
                <div className="bg-white p-8 rounded-[2rem] border border-[#E2D6B2] shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-[#8B7355] tracking-widest border-b pb-2 flex items-center gap-2">
                        📊 Distribución de Categorías Más Solicitadas
                    </h3>
                    <div className="h-64 overflow-y-auto pr-2 space-y-4 custom-scrollbar flex flex-col justify-center">
                        {categoriasDataFinal.slice(0, 4).map((cat) => {
                            const primerElemento = categoriasDataFinal && categoriasDataFinal.length > 0 ? categoriasDataFinal[0] : null;
                            const maxVal = primerElemento && primerElemento.value > 0 ? primerElemento.value : 1;
                            const porcentaje = (cat.value / maxVal) * 100;
                            const anchoPorcentaje = porcentaje + "%";

                            return (
                                <div key={cat.name} className="space-y-1">
                                    <div className="flex justify-between text-xs font-black text-gray-600 uppercase text-[10px]">
                                        <span>📁 {cat.name}</span>
                                        <span className="text-[#8B7355] font-mono font-black">{cat.value} Salidas</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border shadow-inner">
                                        <div 
                                            style={{ width: anchoPorcentaje }} 
                                            className="bg-[#8B7355] h-full rounded-full transition-all duration-500"
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
})()}

                {/*  VISTA: GESTIÓN DE MULTAS */}
                {adminSubView === 'multas' && (
    <div className="bg-white rounded-[2rem] border border-[#E2D6B2] overflow-hidden shadow-sm animate-fade-in text-left">
        <table className="w-full">
            <thead className="bg-[#F5F1E3] border-b text-[10px] font-black uppercase text-[#8B7355]">
                <tr>
                    <th className="p-6 text-left">ID</th>
                    <th className="p-6 text-left">USUARIO</th>
                    <th className="p-6 text-left">MOTIVO</th>
                    <th className="p-6 text-left">MONTO</th>
                    <th className="p-6 text-left">CREACIÓN</th>
                    <th className="p-6 text-left">ESTADO</th>
                    <th className="p-6 text-center">ACCIONES</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {fines.map(m => (
                    <tr key={m.id} className="text-sm hover:bg-gray-50 transition-colors">
                        <td className="p-6 font-bold text-gray-500">#{m.id}</td>
                        <td className="p-6 font-black text-[#5D4037]">{m.user}</td>
                        
                        {/* 🌟 COUPLADO NATIVO: Extracción y separación visual de la descripción del Admin */}
                        <td className="p-6 text-left max-w-xs">
                            <div className="flex flex-col gap-1 text-left">
                                <span className="font-bold text-gray-700">
                                    {m.reason && m.reason.includes(":") ? m.reason.split(":")[0] : "Penalización de Almacén"}
                                </span>
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic bg-gray-50 p-2.5 rounded-xl border border-dashed border-gray-200">
                                    {m.reason && m.reason.includes(":") ? m.reason.split(":").slice(1).join(":") : m.reason}
                                </p>
                            </div>
                        </td>
                        
                        <td className="p-6 font-black text-red-500">S/ {m.amount.toFixed(2)}</td>
                        <td className="p-6 text-gray-500 font-bold">{m.date}</td>
                        <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.status === 'Pagado' || m.status === 'RESUELTO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {m.status}
                            </span>
                        </td>
                        <td className="p-6 text-center">
                            {m.status === 'Pendiente' ? (
                                <button onClick={() => payFine(m.id)} className="px-4 py-2 border-2 border-green-500 text-green-600 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-green-50 transition-all cursor-pointer">Marcar Pagado</button>
                            ) : (
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resuelto</span>
                            )}
                        </td>
                    </tr>
                ))}
                {fines.length === 0 && (
                    <tr><td colSpan="7" className="p-10 text-center text-gray-400 font-bold italic">No hay multas registradas en la base de datos de MySQL.</td></tr>
                )}
            </tbody>
        </table>
    </div>
)}
            </div>
        </div>
    );
};