/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/reactjs.jsx to edit this template
 */
const AdminPanel = ({ 
    adminSubView, setAdminSubView, handleLogout, 
    booksList, allLoans, fines, 
    handleImportarCSV, setShowAddBookModal, 
    approveLoan, returnBook, payFine,
    
    // VARIABLES DE BÚSQUEDA Y FILTRADO
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    categories, filteredBooks,
    
    // VARIABLES DEL MODAL DE EDICIÓN (
    showEditBookModal, setShowEditBookModal,
    bookToEdit, handleAbrirModalEditar,
    handleEditBookForm
}) => {

    
    // --- CÁLCULOS EN TIEMPO REAL DESDE LA BASE DE DATOS (MYSQL) ---
    const totalBooks = booksList.length;
    const activeLoans = allLoans.filter(l => l.status === 'Activo').length;
    const pendingRequests = allLoans.filter(l => l.status === 'Pendiente').length;
    const totalFinesAmount = fines.filter(f => f.status === 'Pendiente').reduce((acc, f) => acc + f.amount, 0);
    const booksAvailable = booksList.filter(b => (b.stock !== undefined ? b.stock : 5) > 0).length;

    // Tomamos las últimas 3 actividades de préstamos para la tabla del Resumen
    const recientesActividades = [...allLoans].slice(0, 3);
    

    return(
       
            /*LAYOUT*/
    

        <div className="flex items-start text-left bg-[#FFFDF5]">
            
           
            
    <aside className="w-64 bg-[#F5F1E3] border-r border-[#D4CDB3] p-8 flex flex-col sticky top-16 h-[calc(100vh-4rem)] shadow-sm flex-shrink-0">
                <div className="flex items-center gap-2 mb-10 mt-2">
                    <i data-lucide="shield-check" className="text-[#8B7355] w-6 h-6"></i>
                    <span className="font-black text-[#5D4037] tracking-tight text-sm uppercase">ADMIN PANEL</span>
                </div>
                <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {[
                        { id: 'overview', label: 'Resumen', icon: 'layout-dashboard' }, 
                        { id: 'libros', label: 'Libros', icon: 'book-open' }, 
                        { id: 'préstamos', label: 'Préstamos Activos', icon: 'refresh-cw' }, 
                        { id: 'historial', label: 'Historial', icon: 'history' },
                        { id: 'multas', label: 'Gestión Multas', icon: 'alert-triangle' } 
                    ].map(item => (
                        <button key={item.id} onClick={() => setAdminSubView(item.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${adminSubView === item.id ? 'bg-[#8B7355] text-white shadow-lg' : 'text-[#5D4037] hover:bg-[#E2D6B2]'}`}>
                            <i data-lucide={item.icon} className="w-4 h-4"></i> {item.label}
                        </button>
                    ))}
                </nav>
                <button onClick={handleLogout} className="text-red-500 font-black text-xs uppercase flex items-center gap-2 mt-6 pt-6 border-t border-[#D4CDB3] hover:underline">
                    <i data-lucide="log-out" className="w-4 h-4"></i> Salir del Sistema
                </button>
            </aside>

            {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
                  
          
            <div className="flex-1 p-10 lg:p-16 overflow-x-hidden">
                <div className="flex justify-between items-center mb-12 border-b border-gray-200 pb-6">
                    <h2 className="text-4xl font-black text-[#5D4037] uppercase tracking-tighter">{adminSubView === 'overview' ? 'Resumen General' : adminSubView}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Panel de Control de Almacén</p>
                </div>
                
                {/*   VISTA: RESUMEN (OVERVIEW)   */}
    
                {adminSubView === 'overview' && (
                    <div className="space-y-10 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-[#E2D6B2] shadow-sm flex items-center gap-4">
                                <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-md"><i data-lucide="book" className="w-6 h-6"></i></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Libros Catálogo</p><p className="text-3xl font-black text-[#5D4037]">{totalBooks}</p></div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-[#E2D6B2] shadow-sm flex items-center gap-4">
                                <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-md"><i data-lucide="clock" className="w-6 h-6"></i></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Por Entregar</p><p className="text-3xl font-black text-[#5D4037]">{pendingRequests}</p></div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-[#E2D6B2] shadow-sm flex items-center gap-4">
                                <div className="bg-green-500 p-3 rounded-2xl text-white shadow-md"><i data-lucide="refresh-cw" className="w-6 h-6"></i></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En Alumno</p><p className="text-3xl font-black text-[#5D4037]">{activeLoans}</p></div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-[#E2D6B2] shadow-sm flex items-center gap-4">
                                <div className="bg-red-500 p-3 rounded-2xl text-white shadow-md"><i data-lucide="dollar-sign" className="w-6 h-6"></i></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Caja por Cobrar</p><p className="text-3xl font-black text-red-600">S/ {totalFinesAmount.toFixed(2)}</p></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-[#E2D6B2] shadow-sm space-y-6">
                                <h4 className="font-black text-[#5D4037] text-sm uppercase tracking-wider flex items-center gap-2"><i data-lucide="pie-chart" className="text-[#8B7355] w-4 h-4"></i> Balance del Almacén</h4>
                                <div className="space-y-5 pt-2">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2 text-gray-600"><span>Libros Disponibles con Stock</span><span className="text-blue-600 font-extrabold">{booksAvailable}</span></div>
                                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden"><div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${totalBooks > 0 ? (booksAvailable / totalBooks) * 100 : 0}%`}}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2 text-gray-600"><span>Libros Fuera (Prestados)</span><span className="text-orange-500 font-extrabold">{activeLoans}</span></div>
                                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden"><div className="bg-orange-400 h-full transition-all duration-1000" style={{width: `${totalBooks > 0 ? (activeLoans / totalBooks) * 100 : 0}%`}}></div></div>
                                    </div>
                                </div>
                                <div className="bg-[#F5F1E3] p-4 rounded-2xl text-center text-xs font-bold text-[#5D4037] mt-4">
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-[#E2D6B2] shadow-sm">
                                <h4 className="font-black text-[#5D4037] text-sm uppercase tracking-wider mb-6 flex items-center gap-2"><i data-lucide="activity" className="text-[#8B7355] w-4 h-4"></i> Últimas Solicitudes Registradas</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b pb-2">
                                            <tr><th className="pb-3">Estudiante</th><th className="pb-3">Recurso</th><th className="pb-3 text-right">Estado</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {recientesActividades.map(act => (
                                                <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 font-bold text-[#5D4037]">{act.user}</td>
                                                    <td className="py-4 text-gray-500 max-w-[200px] truncate">{act.title}</td>
                                                    <td className="py-4 text-right"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${act.status === 'Activo' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>{act.status}</span></td>
                                                </tr>
                                            ))}
                                            {recientesActividades.length === 0 && (
                                                <tr><td colSpan="3" className="py-10 text-center text-gray-400 font-bold italic">No registras movimientos en las tablas de MySQL.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
               {/* VISTA: GESTIÓN DE LIBROS CORREGIDA CON FILTROS Y BOTÓN EDITAR */}
{adminSubView === 'libros' && (
    <div className="space-y-6 animate-fade-in">
        
        {/* NUEVA SECCIÓN Revisen porfa compañeros: Barra de Búsqueda y Filtro por Categoría */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#E2D6B2] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 w-full md:w-auto gap-4">
                {/* Input de texto para buscar por Título o Autor */}
                <input 
                    type="text" 
                    placeholder="Buscar por título o autor..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-1 p-4 border-2 border-[#E2D6B2] focus:border-[#8B7355] outline-none rounded-2xl font-bold text-sm"
                />
                {/* Selector para filtrar por Categoría */}
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
            </div>
            
            {/* Contenedor de Botones Superiores Originales */}
            <div className="flex gap-4 w-full md:w-auto justify-end">
                <label className="px-6 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider">
                    <i data-lucide="file-spreadsheet" className="w-4 h-4"></i> 
                    Importar CSV
                    <input type="file" accept=".csv" onChange={handleImportarCSV} className="hidden" />
                </label>
                <button 
                    onClick={() => setShowAddBookModal(true)} 
                    className="px-6 py-4 bg-[#8B7355] text-white font-black rounded-2xl shadow-xl text-xs uppercase tracking-wider flex items-center gap-2"
                >
                    <i data-lucide="plus-circle" className="w-4 h-4"></i> 
                    Nuevo Libro
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
                        {/* Encabezado de Acciones */}
                        <th className="p-6 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {/* filtros de búsqueda */}
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
                            {/* Botón de Edición */}
                            <td className="p-6 text-center">
                                <button 
                                    onClick={() => handleAbrirModalEditar(b)} 
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1.5 mx-auto"
                                >
                                    <i data-lucide="edit-3" className="w-3.5 h-3.5"></i>
                                    Editar
                                </button>
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


                {/* VISTA: PRÉSTAMOS ACTIVOS */}
    
                {adminSubView === 'préstamos' && (
                    <div className="bg-white rounded-[2rem] border border-[#E2D6B2] overflow-hidden shadow-sm animate-fade-in">
                        <table className="w-full">
                            <thead className="bg-[#F5F1E3] border-b text-[10px] font-black uppercase text-[#8B7355]">
                                <tr><th className="p-6 text-left">Estudiante</th><th className="p-6 text-left">Libro</th><th className="p-6 text-left">Línea de Tiempos</th><th className="p-6 text-left">Estado</th><th className="p-6 text-left">Acción</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allLoans.filter(l => l.status !== 'Devuelto').map(l => (
                                    <tr key={l.id} className="text-sm hover:bg-gray-50 transition-colors">
                                        <td className="p-6 font-bold">{l.user}</td>
                                        <td className="p-6 text-gray-500">{l.title}</td>
                                        <td className="p-6 text-[11px] text-gray-400 font-medium leading-relaxed">
                                            📅 Solicitado: <span className="text-gray-700 font-bold">{l.date || 'Hoy'}</span><br/>
                                            📥 Entregado: <span className="text-blue-600 font-bold">{l.status === 'Pendiente' ? 'Pendiente entrega' : l.fechaEntrega}</span><br/>
                                            🚨 Vence: <span className="text-red-500 font-bold">{l.dueDate || 'Calculando en aprobación'}</span>
                                        </td>
                                        <td className="p-6"><span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${l.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{l.status}</span></td>
                                        <td className="p-6">
                                            {l.status === 'Pendiente' && <button onClick={() => approveLoan(l.id)} className="px-4 py-2 bg-[#8B7355] text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-[#6F5A43] transition-colors">Entregar</button>}
                                            {l.status === 'Activo' && <button onClick={() => returnBook(l.id, l.bookId)} className="px-4 py-2 border-2 border-[#8B7355] text-[#8B7355] rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-[#F5F1E3] transition-colors">Recibir</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* VISTA: HISTORIAL DE ENTREGAS*/}
                
                {adminSubView === 'historial' && (
                    <div className="bg-white rounded-[2rem] border border-[#E2D6B2] overflow-hidden shadow-sm animate-fade-in">
                        <table className="w-full"><thead className="bg-gray-100 border-b text-[10px] font-black uppercase text-gray-600"><tr><th className="p-6 text-left">Estudiante</th><th className="p-6 text-left">Libro</th><th className="p-6 text-left">Fecha Devuelto</th><th className="p-6 text-left">Estado Final</th></tr></thead><tbody className="divide-y divide-gray-100">{allLoans.filter(l => l.status === 'Devuelto').map(l => (
                            <tr key={l.id} className="text-sm bg-gray-50 opacity-70 hover:opacity-100 transition-opacity"><td className="p-6 font-bold">{l.user}</td><td className="p-6 text-gray-500">{l.title}</td><td className="p-6 text-gray-500 font-bold">{l.fechaDevolucionReal || 'Hoy'}</td><td className="p-6"><span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-gray-200 text-gray-600">Archivado</span></td></tr>
                        ))}{allLoans.filter(l => l.status === 'Devuelto').length === 0 && (<tr><td colSpan="4" className="p-6 text-center text-gray-400 font-bold">No hay préstamos en el historial aún.</td></tr>)}</tbody></table>
                    </div>
                )}

                {/*  VISTA: GESTIÓN DE MULTAS */}
                {adminSubView === 'multas' && (
                    <div className="bg-white rounded-[2rem] border border-[#E2D6B2] overflow-hidden shadow-sm animate-fade-in">
                        <table className="w-full">
                            <thead className="bg-[#F5F1E3] border-b text-[10px] font-black uppercase text-[#8B7355]">
                                <tr>
                                    <th className="p-6 text-left">ID</th>
                                    <th className="p-6 text-left">USUARIO</th>
                                    <th className="p-6 text-left">MOTIVO</th>
                                    <th className="p-6 text-left">MONTO</th>
                                    <th className="p-6 text-left">CREACIÓN</th>
                                    <th className="p-6 text-left">ESTADO</th>
                                    <th className="p-6 text-left">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {fines.map(m => (
                                    <tr key={m.id} className="text-sm hover:bg-gray-50 transition-colors">
                                        <td className="p-6 font-bold text-gray-500">#{m.id}</td>
                                        <td className="p-6 font-black">{m.user}</td>
                                        <td className="p-6 text-gray-500">{m.reason}</td>
                                        <td className="p-6 font-black text-red-500">S/ {m.amount.toFixed(2)}</td>
                                        <td className="p-6 text-gray-500 font-bold">{m.date}</td>
                                        <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span></td>
                                        <td className="p-6">
                                            {m.status === 'Pendiente' ? (
                                                <button onClick={() => payFine(m.id)} className="px-4 py-2 border-2 border-green-500 text-green-600 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-green-50 transition-all">Marcar Pagado</button>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resuelto</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {fines.length === 0 && (<tr><td colSpan="7" className="p-6 text-center text-gray-400 font-bold">No hay multas registradas en la base de datos.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};