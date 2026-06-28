/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/reactjs.jsx to edit this template
 */
const { useState, useMemo, useEffect } = React;

const CountdownTimer = ({ targetDate, status }) => {
    if (status === 'Pendiente') return <span className="text-orange-500 font-bold italic animate-pulse">A la espera de entrega</span>;
    if (status === 'Devuelto') return <span className="text-gray-400 italic">Devuelto e Historial</span>;
    if (!targetDate) return <span className="text-gray-400 italic">Sin fecha asignada</span>;

    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate + "T23:59:59") - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = { dias: Math.floor(difference / (1000 * 60 * 60 * 24)), horas: Math.floor((difference / (1000 * 60 * 60)) % 24), minutos: Math.floor((difference / 1000 / 60) % 60) };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => { const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000); return () => clearInterval(timer); }, [targetDate]);

    if (!timeLeft.dias && !timeLeft.horas && !timeLeft.minutos) return <span className="text-red-600 font-black bg-red-50 px-3 py-1 rounded-xl border border-red-200 animate-pulse">⚠️ PLAZO EXPIRADO</span>;
    return <span className="font-extrabold text-xs text-[#8B7355] bg-[#F5F1E3] px-3 py-1.5 rounded-xl shadow-inner inline-flex items-center gap-1.5">⏳ {timeLeft.dias}d {timeLeft.horas}h {timeLeft.minutos}m</span>;
};

const MainApp = () => {
    const [view, setView] = useState(() => localStorage.getItem('userType') === 'admin' ? 'admin' : 'landing'); 
    const [userType, setUserType] = useState(() => localStorage.getItem('userType') || "visitante"); 
    
    // Aquí se inicializan los datos guardados del usuario de forma limpia
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('userData');
        return saved ? JSON.parse(saved) : { nombre: '', apellido: '', correo: '', numero: '', dni: '', apodo: '' };
    }); // AQUÍ CIERRA CORRECTAMENTE EL USERDATA ORIGINAL

    // las variables de edición están afuera, listas y operativas
    const [showEditBookModal, setShowEditBookModal] = useState(false);
    const [bookToEdit, setBookToEdit] = useState(null);

    const handleAbrirModalEditar = (libro) => {
        setBookToEdit(libro);
        setShowEditBookModal(true);
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [userPanelTab, setUserPanelTab] = useState('prestamos'); 
    const [adminSubView, setAdminSubView] = useState('overview');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [tiempoPrestamo, setTiempoPrestamo] = useState('1_semana');

    // Las categorias ahora viven en la base de datos (tabla "categorias",
    // CRUD via /api/categorias). Antes era un arreglo fijo en el código y
    // por eso el menú "Categorías" del panel admin no hacía nada real.
    const [categories, setCategories] = useState([]);
    // Lista que se muestra en la tabla del panel admin (puede ser un subconjunto
    // cuando el admin está buscando por nombre).
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
    const [categorySearchTerm, setCategorySearchTerm] = useState("");

    const [booksList, setBooksList] = useState([]);
    const [allLoans, setAllLoans] = useState([]);
    const [cart, setCart] = useState([]);
    const [fines, setFines] = useState([]);

    const cargarDatosDesdeBD = () => {
        fetch(`${API_BASE_URL}/api/libros`).then(res => res.json()).then(setBooksList).catch(() => {});
        
        fetch(`${API_BASE_URL}/api/prestamos/listar`).then(res => res.json()).then(data => {
                setAllLoans(data.map(p => ({ 
                    id: p.id, bookId: p.libroId || p.libro_id, title: p.tituloLibro || p.titulo_libro, 
                    user: p.nombreUsuario || p.nombre_usuario, date: p.fechaPrestamo || p.fecha_prestamo, 
                    dueDate: p.fechaVencimiento || p.fecha_vencimiento, status: p.estado,
                    fechaEntrega: p.fechaEntrega || p.fecha_entrega, fechaDevolucionReal: p.fechaDevolucionReal || p.fecha_devolucion_real
                })));
            }).catch(() => {});
            
        fetch(`${API_BASE_URL}/api/multas`).then(res => res.json()).then(setFines).catch(() => {});

        cargarCategorias();
    };

    // Trae el listado completo de categorías desde la BD (tabla "categorias")
    // y refresca tanto el listado "maestro" (selects, filtros del catálogo)
    // como la tabla del panel admin.
    const cargarCategorias = () => {
        fetch(`${API_BASE_URL}/api/categorias`)
            .then(res => res.json())
            .then(data => { setCategories(data); setCategoriasFiltradas(data); setCategorySearchTerm(""); })
            .catch(() => {});
    };

    // Registrar una nueva categoría (POST /api/categorias)
    const handleAddCategory = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const nuevaCategoria = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            estado: formData.get('estado')
        };

        fetch(`${API_BASE_URL}/api/categorias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCategoria)
        })
        .then(res => {
            if (!res.ok) throw new Error("No se pudo guardar la categoría en la base de datos.");
            return res.json();
        })
        .then(() => {
            e.target.reset();
            cargarCategorias();
        })
        .catch(err => alert(err.message));
    };

    // Eliminar una categoría existente (DELETE /api/categorias/{id})
    const handleDeleteCategory = (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;

        fetch(`${API_BASE_URL}/api/categorias/${id}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error("No se pudo eliminar la categoría.");
                cargarCategorias();
            })
            .catch(err => alert(err.message));
    };

    // Buscar categorías por nombre (GET /api/categorias/buscar?nombre=...)
    // Si el texto queda vacío, vuelve a traer el listado completo.
    const handleBuscarCategoria = (texto) => {
        setCategorySearchTerm(texto);
        const url = texto.trim() === ""
            ? `${API_BASE_URL}/api/categorias`
            : `${API_BASE_URL}/api/categorias/buscar?nombre=${encodeURIComponent(texto.trim())}`;

        fetch(url).then(res => res.json()).then(setCategoriasFiltradas).catch(() => {});
    };

    useEffect(() => { cargarDatosDesdeBD(); }, []);
    useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [view, selectedCategory, isCartOpen, adminSubView, showAddBookModal, cart, userType, allLoans, userPanelTab, booksList, fines]);

    const handleLogout = () => { 
    localStorage.clear();       // Borra la sesión del usuario del navegador
    setUserType('visitante');   // Restablece el rol a visitante
    setView('landing');         // Manda la interfaz a la página de inicio
    
    // Fuerza la recarga completa y limpia del sitio web
    window.location.reload(); 
};
    const addToCart = (book) => { const stockActual = book.stock !== undefined ? book.stock : 5; if (stockActual > 0 && !cart.find(i => i.id === book.id)) { setCart([...cart, book]); setIsCartOpen(true); } };
    
    const handleConfirmLoan = () => {
        if (cart.length === 0) return;
        const promesas = cart.map(item => fetch(`${API_BASE_URL}/api/prestamos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ libroId: item.id, titulo: item.titulo, usuario: `${userData.nombre} ${userData.apellido}` })}));
        Promise.all(promesas).then(() => { alert("Reserva guardada en Base de Datos"); setCart([]); setIsCartOpen(false); cargarDatosDesdeBD(); setView('user-panel'); setUserPanelTab('prestamos'); });
    };

    const approveLoan = (loanId) => fetch(`${API_BASE_URL}/api/prestamos/estado`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prestamoId: loanId, nuevoEstado: 'Activo', libroId: 0 }) }).then(() => { cargarDatosDesdeBD(); });
    const returnBook = (loanId, bookId) => fetch(`${API_BASE_URL}/api/prestamos/estado`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prestamoId: loanId, nuevoEstado: 'Devuelto', libroId: bookId }) }).then(() => { cargarDatosDesdeBD(); });
    const payFine = (multaId) => fetch(`${API_BASE_URL}/api/multas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ multaId: multaId }) }).then(() => { alert("¡Multa marcada como pagada en el sistema!"); cargarDatosDesdeBD(); });


// FUNCIONES DE CONEXIÓN 


const handleRegisterUser = (e) => { 
    e.preventDefault(); 
    const formData = new FormData(e.target); 
    const passwordIngresado = formData.get('clave');

    // FILTRO DE CONTRASENIA ROBUSTA (Expresión Regular)
    const regexContrasenia = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{10,}$/;

    if (!regexContrasenia.test(passwordIngresado)) {
        alert(
            "Contraseña débil. Tu contraseña debe cumplir con los siguientes requisitos:\n" +
            "• Tener un mínimo de 10 caracteres.\n" +
            "• Contener al menos 1 letra mayúscula.\n" +
            "• Contener al menos 1 número.\n" +
            "• Contener al menos 1 símbolo (@, $, !, %, *, ?, &, #)."
        );
        return; // Detiene el proceso por completo y no envía nada a Java
    }

    // Flujo normal de empaquetado si pasa la validación de seguridad
    const u = { 
        nombre: formData.get('nombre'), 
        apellido: formData.get('apellido'), 
        correo: formData.get('correo'), 
        numero: formData.get('numero'), 
        dni: formData.get('dni'), 
        clave: passwordIngresado, 
        apodo: formData.get('nombre').substring(0, 5), 
        tipoUsuario: 'estudiante' 
    }; 
    
    fetch(`${API_BASE_URL}/api/usuarios`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(u) 
    })
    .then(async (res) => {
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.mensaje || "Error al procesar el registro.");
        }
        return res.json();
    })
    .then(() => { 
        localStorage.setItem('userType', 'estudiante'); 
        localStorage.setItem('userData', JSON.stringify(u)); 
        setUserData(u); 
        setUserType('estudiante'); 
        setView('landing'); 
        alert("¡Registrado exitosamente!"); 
        window.location.reload(); 
    })
    .catch((error) => {
        alert(error.message); 
    }); 
};


const handleLogin = (e) => { 
    e.preventDefault(); 
    const formData = new FormData(e.target); 
    
    const datosLogin = { 
        correo: formData.get('correo'), 
        clave: formData.get('clave') // Alineado con LoginServlet de Java
    };

    fetch(`${API_BASE_URL}/api/login`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(datosLogin) 
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Credenciales inválidas");
        }
        return res.json();
    })
    .then(data => { 
        localStorage.setItem('userType', data.tipoUsuario); 
        localStorage.setItem('userData', JSON.stringify(data)); 
        setUserData(data); 
        setUserType(data.tipoUsuario); 
        setView(data.tipoUsuario === 'admin' ? 'admin' : 'landing'); 
        window.location.reload(); // Recarga limpia para actualizar catálogo/interfaz
    })
    .catch(() => alert("Contraseña inválida o usuario no encontrado.")); 
};

    
    
    const handleAddNewBookForm = (e) => { e.preventDefault(); const formData = new FormData(e.target); fetch(`${API_BASE_URL}/api/libros`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: formData.get('titulo'), isbn: formData.get('isbn'), autor: formData.get('autor'), categoria: formData.get('categoria'), editorial: formData.get('editorial'), anio: formData.get('anio'), imagenUrl: formData.get('imagenUrl') || "https://images.unsplash.com/photo-1543004218-ee141104308d?w=300" }) }).then(() => { alert("Libro guardado"); setShowAddBookModal(false); cargarDatosDesdeBD(); }); };
    const handleEditBookForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Petición PUT al Servlet de Java enviando el JSON del libro modificado
    fetch(`${API_BASE_URL}/api/libros`, {
        method: 'PUT', // Método PUT para actualizaciones
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: parseInt(formData.get('id')), // ID indispensable para el WHERE en SQL
            titulo: formData.get('titulo'),
            isbn: formData.get('isbn'),
            autor: formData.get('autor'),
            categoria: formData.get('categoria'),
            editorial: formData.get('editorial'),
            anio: formData.get('anio'),
            imagenUrl: formData.get('imagenUrl'),
            stock: parseInt(formData.get('stock')),
            estado: formData.get('estado')
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al actualizar");
        alert("¡Libro actualizado con éxito en el almacén!");
        setShowEditBookModal(false); // Cierra el modal
        cargarDatosDesdeBD();       // Recarga la lista en tiempo real
    })
    .catch(() => alert("No se pudo actualizar el libro."));
};

    const handleImportarCSV = (e) => { /* Lógica CSV Omitida para espacio, igual que antes */ };
    const handleUpdateProfile = (e) => { e.preventDefault(); const formData = new FormData(e.target); const updatedUser = { ...userData, correo: formData.get('correo'), apodo: formData.get('apodo') }; setUserData(updatedUser); localStorage.setItem('userData', JSON.stringify(updatedUser)); alert("¡Perfil actualizado con éxito!"); };

    const filteredBooks = useMemo(() => booksList.filter(b => (!b || !b.titulo || !b.autor) ? false : (selectedCategory === "Todos" || b.categoria === selectedCategory) && (b.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || b.autor.toLowerCase().includes(searchQuery.toLowerCase()))), [searchQuery, selectedCategory, booksList]);
    const nuevosLibros = useMemo(() => [...booksList].reverse().slice(0, 4), [booksList]);

    const nombreCompletoActual = `${userData.nombre} ${userData.apellido}`.trim().toLowerCase();

    if (view === 'register') return <RegisterView handleRegisterUser={handleRegisterUser} setView={setView} />;
    if (view === 'login') return <LoginView handleLogin={handleLogin} setView={setView} />;

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-[#F5F1E3] border-b border-[#D4CDB3] sticky top-0 z-50 h-16 flex items-center px-8 shadow-sm">
                <div className="flex items-center gap-2 cursor-pointer mr-auto" onClick={() => { if(userType === 'admin'){ setView('admin'); setAdminSubView('overview'); } else { setView('landing'); } }}><i data-lucide="library" className="text-[#8B7355] w-8 h-8"></i><span className="font-bold text-[#5D4037] uppercase">BENP</span></div>
                <div className="flex items-center space-x-6">
                    {userType !== 'admin' && <button onClick={() => setView('landing')} className="text-xs font-black text-[#5D4037]">Inicio</button>}
                    {userType === 'estudiante' && <button onClick={() => setView('user-panel')} className="text-sm font-bold text-[#5D4037] bg-white px-4 py-2 rounded-xl border"><i data-lucide="user" className="w-4 h-4 inline-block mr-1"></i>{userData.apodo}</button>}
                    {userType !== 'admin' && <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#5D4037]"><i data-lucide="shopping-bag" className="w-5 h-5"></i>{cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}</button>}
                    {userType === 'visitante' ? <button onClick={() => setView('login')} className="px-5 py-2 bg-[#8B7355] text-white rounded-xl text-xs font-black">INGRESAR</button> : <button onClick={handleLogout} className="text-xs font-black text-red-500 flex items-center gap-1"><i data-lucide="log-out" className="w-4 h-4"></i>SALIR</button>}
                </div>
            </nav>

            <main className="flex-1">
                {/* 🔍 BUSCA ESTA SECCIÓN EN TU App.jsx Y REEMPLÁZALA COMPLETA POR ESTA: */}
{view === 'admin' ? (
    <AdminPanel 
        adminSubView={adminSubView} 
        setAdminSubView={setAdminSubView} 
        handleLogout={handleLogout} 
        booksList={booksList} 
        allLoans={allLoans} 
        fines={fines} 
        handleImportarCSV={handleImportarCSV} 
        setShowAddBookModal={setShowAddBookModal} 
        approveLoan={approveLoan} 
        returnBook={returnBook} 
        payFine={payFine} 
        
        // Propiedades de búsqueda y filtrado
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        filteredBooks={filteredBooks}

        // Propiedades del CRUD de Categorías (interactúan con la BD)
        categoriasFiltradas={categoriasFiltradas}
        handleAddCategory={handleAddCategory}
        handleDeleteCategory={handleDeleteCategory}
        categorySearchTerm={categorySearchTerm}
        handleBuscarCategoria={handleBuscarCategoria}
        
        // Propiedades críticas del modal de edición
        showEditBookModal={showEditBookModal}
        setShowEditBookModal={setShowEditBookModal}
        bookToEdit={bookToEdit}
        handleAbrirModalEditar={handleAbrirModalEditar}
        handleEditBookForm={handleEditBookForm}
    />
) : view === 'user-panel' ? (

                    <div className="max-w-6xl mx-auto p-16 text-left">
                        <button onClick={() => setView('landing')} className="flex items-center gap-2 text-[#8B7355] font-bold text-sm mb-6"><i data-lucide="arrow-left" className="w-4 h-4"></i> Volver</button>
                        <div className="flex justify-between items-end mb-12 border-b pb-8">
                            <div><h1 className="text-4xl font-black text-[#5D4037]">Mi Perfil</h1></div>
                            <div className="flex bg-[#F5F1E3] p-1.5 rounded-2xl border">
                                <button onClick={() => setUserPanelTab('prestamos')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${userPanelTab === 'prestamos' ? 'bg-[#8B7355] text-white shadow-md' : 'text-[#8B7355]'}`}>Préstamos</button>
                                <button onClick={() => setUserPanelTab('deudas')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${userPanelTab === 'deudas' ? 'bg-[#8B7355] text-white shadow-md' : 'text-[#8B7355]'}`}>Deudas</button>
                                <button onClick={() => setUserPanelTab('perfil')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${userPanelTab === 'perfil' ? 'bg-[#8B7355] text-white shadow-md' : 'text-[#8B7355]'}`}>Mis Datos</button>
                            </div>
                        </div>

                        {userPanelTab === 'prestamos' ? (
                            <table className="w-full bg-white rounded-[2rem] border overflow-hidden shadow-sm">
                                <thead className="bg-[#F5F1E3] text-[10px] font-black text-[#8B7355] uppercase">
                                    <tr><th className="p-5 text-left">Libro Solicitado</th><th className="p-5 text-left">Tiempo Restante para Devolución</th><th className="p-5 text-left">Estado</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {allLoans.filter(l => l.user && l.user.trim().toLowerCase() === nombreCompletoActual).map(loan => (
                                        <tr key={loan.id} className="text-sm">
                                            <td className="p-5 font-bold">{loan.title}</td>
                                            <td className="p-5"><CountdownTimer targetDate={loan.dueDate} status={loan.status} /></td>
                                            <td className="p-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${loan.status === 'Pendiente' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>{loan.status}</span></td>
                                        </tr>
                                    ))}
                                    {allLoans.filter(l => l.user && l.user.trim().toLowerCase() === nombreCompletoActual).length === 0 && (
                                        <tr><td colSpan="3" className="p-5 text-center text-gray-400 font-bold">No registras solicitudes en este momento.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        
                        ) : userPanelTab === 'deudas' ? (
                            <table className="w-full bg-white rounded-[2rem] border overflow-hidden shadow-sm">
                                <thead className="bg-[#F5F1E3] text-[10px] font-black text-[#8B7355] uppercase">
                                    <tr><th className="p-5 text-left">Libro Relacionado</th><th className="p-5 text-left">Motivo de Infracción</th><th className="p-5 text-left">Monto</th><th className="p-5 text-left">Estado</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {fines.filter(f => f.user && f.user.trim().toLowerCase() === nombreCompletoActual).map(multa => (
                                        <tr key={multa.id} className="text-sm">
                                            <td className="p-5 font-bold">{multa.book || 'N/A'}</td>
                                            <td className="p-5 text-gray-500">{multa.reason}</td>
                                            <td className="p-5 font-black text-red-500">S/ {multa.amount.toFixed(2)}</td>
                                            <td className="p-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${multa.status === 'Pendiente' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{multa.status}</span></td>
                                        </tr>
                                    ))}
                                    {fines.filter(f => f.user && f.user.trim().toLowerCase() === nombreCompletoActual).length === 0 && (
                                        <tr><td colSpan="4" className="p-5 text-center text-green-500 font-bold">No registras multas ni deudas. ¡Excelente historial!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div className="max-w-4xl bg-white rounded-[3rem] p-10 border mx-auto shadow-sm">
                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#8B7355]">Correo (Editable)</label><input name="correo" defaultValue={userData.correo} required type="email" className="w-full p-4 bg-white border-2 border-[#E2D6B2] focus:border-[#8B7355] outline-none rounded-2xl font-bold" /></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#8B7355]">Apodo (Editable)</label><input name="apodo" defaultValue={userData.apodo} required className="w-full p-4 bg-white border-2 border-[#E2D6B2] focus:border-[#8B7355] outline-none rounded-2xl font-bold" /></div>
                                        <div className="space-y-2 opacity-50"><label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><i data-lucide="lock" className="w-3 h-3"></i> Nombre (Bloqueado)</label><input disabled value={userData.nombre + " " + userData.apellido} className="w-full p-4 bg-gray-100 border rounded-2xl cursor-not-allowed" /></div>
                                        <div className="space-y-2 opacity-50"><label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><i data-lucide="lock" className="w-3 h-3"></i> DNI (Bloqueado)</label><input disabled value={userData.dni} className="w-full p-4 bg-gray-100 border rounded-2xl cursor-not-allowed" /></div>
                                    </div>
                                    <div className="flex justify-end pt-4"><button type="submit" className="px-8 py-4 bg-[#8B7355] text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:bg-[#6F5A43] transition-all">Guardar Cambios</button></div>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <React.Fragment>
                        <header className="bg-[#E2D6B2] py-20 px-4 text-center">
                            <h1 className="text-5xl font-black text-[#5D4037] uppercase">Biblioteca Digital</h1>
                            <div className="relative max-w-2xl mx-auto mt-6"><input type="text" placeholder="Buscar por título o autor..." className="w-full pl-6 pr-6 py-5 rounded-3xl outline-none shadow-xl text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                        </header>
                        {nuevosLibros.length > 0 && !searchQuery && (
                            <section className="max-w-7xl mx-auto px-4 pt-12 text-left">
                                <h2 className="text-2xl font-black text-[#8B7355] uppercase tracking-tighter mb-6 flex items-center gap-2">🔥 Nuevos Libros</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-[#FDFBF7] p-6 rounded-[2rem] border-2 border-dashed border-[#E2D6B2]">
                                    {nuevosLibros.map(book => {
                                        const stockActual = book.stock !== undefined ? book.stock : 5;
                                        return (
                                        <div key={book.id} className="bg-white p-4 rounded-3xl shadow-sm border flex flex-col justify-between">
                                            <img src={book.imagenUrl} className="w-full h-40 object-cover rounded-2xl mb-3" />
                                            <div>
                                                <div className="flex justify-between items-center"><span className="text-[8px] font-black uppercase text-[#8B7355] bg-[#F5F1E3] px-2 py-0.5 rounded">{book.categoria}</span><span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${stockActual > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>Stock: {stockActual}</span></div>
                                                <h4 className="font-extrabold text-[#5D4037] text-sm mt-1 line-clamp-1">{book.titulo}</h4><p className="text-xs text-gray-400 italic">por {book.autor}</p>
                                            </div>
                                            <button disabled={stockActual <= 0} onClick={() => { if(userType === 'visitante') setView('login'); else addToCart(book); }} className={`w-full mt-3 py-2 text-white text-xs font-bold rounded-xl transition-all ${stockActual > 0 ? 'bg-[#8B7355] hover:bg-[#6F5A43]' : 'bg-gray-300 cursor-not-allowed'}`}>{stockActual > 0 ? 'RESERVAR' : 'AGOTADO'}</button>
                                        </div>
                                    )})}
                                </div>
                            </section>
                        )}
                        <section className="max-w-7xl mx-auto px-4 py-16 text-left">
                            <div className="flex justify-between items-center mb-12 gap-6">
                                <h2 className="text-3xl font-black text-[#5D4037] uppercase">Catálogo General</h2>
                                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                                    {["Todos", ...categories.map(c => c.nombre)].map(cat => (
                                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase ${selectedCategory === cat ? 'bg-[#8B7355] text-white' : 'bg-white text-[#8B7355] border'}`}>{cat}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-10">
                                {filteredBooks.map(book => {
                                    const stockActual = book.stock !== undefined ? book.stock : 5;
                                    return (
                                    <div key={book.id} className="bg-white rounded-[2.5rem] overflow-hidden border shadow-sm flex flex-col h-[520px]">
                                        <img src={book.imagenUrl} className="w-full h-72 object-cover" />
                                        <div className="p-6 flex flex-col flex-grow text-left">
                                            <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-black text-[#8B7355] uppercase bg-[#F5F1E3] px-2 py-1 rounded">{book.categoria}</span><span className={`text-[10px] font-black px-2 py-1 rounded-full ${stockActual > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>STOCK: {stockActual}</span></div>
                                            <h3 className="text-lg font-extrabold text-[#5D4037] line-clamp-2">{book.titulo}</h3>
                                            <p className="text-gray-400 text-xs mt-1">por {book.autor}</p>
                                            <button disabled={stockActual <= 0} onClick={() => { if(userType === 'visitante') setView('login'); else addToCart(book); }} className={`w-full py-4 text-white font-black rounded-2xl text-xs mt-auto transition-all ${stockActual > 0 ? 'bg-[#8B7355] hover:bg-[#6F5A43]' : 'bg-gray-300 cursor-not-allowed'}`}>{stockActual > 0 ? 'RESERVAR LIBRO' : 'AGOTADO'}</button>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </section>
                    </React.Fragment>
                )}
            </main>

            {/* MODALES REUTILIZADOS */}
            <div className={`fixed inset-0 z-[60] ${isCartOpen ? 'block' : 'hidden'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl p-8 flex flex-col">
                    <h3 className="text-2xl font-black text-[#5D4037] mb-8 border-b pb-4">Tu Reserva</h3>
                    <div className="flex-1 overflow-y-auto space-y-6 text-left">
                        {cart.map(item => (
                            <div key={item.id} className="flex gap-4 p-2 bg-gray-50 rounded-2xl relative">
                                <img src={item.imagenUrl} className="w-12 h-16 object-cover rounded-lg shadow" />
                                <div><p className="font-bold text-sm text-[#5D4037]">{item.titulo}</p></div>
                                <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="absolute -top-1 -right-1 bg-red-100 text-red-500 p-1 rounded-full"><i data-lucide="x" className="w-3 h-3"></i></button>
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t space-y-4">
                        <div className="flex justify-between items-center bg-[#F5F1E3] p-4 rounded-xl">
                            <div><p className="text-[10px] font-black text-[#8B7355] uppercase">Tiempo de Alquiler</p><select value={tiempoPrestamo} onChange={(e) => setTiempoPrestamo(e.target.value)} className="bg-transparent font-black text-[#5D4037] outline-none text-xs mt-1"><option value="1_semana">1 Semana (S/ 5.00)</option><option value="15_dias">15 Días (S/ 8.00)</option><option value="1_mes">1 Mes (S/ 15.00)</option></select></div>
                            <div className="text-right"><p className="text-[10px] font-black text-[#8B7355] uppercase">Total Tarifa</p><p className="font-black text-lg text-[#5D4037]">S/ {(cart.length * (tiempoPrestamo === '1_semana' ? 5 : tiempoPrestamo === '15_dias' ? 8 : 15)).toFixed(2)}</p></div>
                        </div>
                        <button disabled={cart.length === 0} onClick={handleConfirmLoan} className="w-full py-4 bg-[#8B7355] text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:bg-[#6F5A43]">Confirmar Solicitud</button>
                    </div>
                </div>
            </div>

            {/* --- AQUÍ ESTÁ EL MODAL DE NUEVO LIBRO  --- */}
            {showAddBookModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddBookModal(false)}></div>
                    <form onSubmit={handleAddNewBookForm} className="relative bg-white w-full max-w-4xl p-10 rounded-[2rem] shadow-2xl animate-pop-in text-left flex flex-col md:flex-row gap-10">
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            <h3 className="text-2xl font-black text-[#5D4037] mb-6 uppercase tracking-tighter w-full border-b pb-4">Nuevo Registro</h3>
                            <div className="w-full aspect-[2/3] border-4 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 mb-4 bg-gray-50"><span className="text-[10px] font-black uppercase tracking-widest">Preview Portada</span></div>
                            <input name="imagenUrl" type="url" placeholder="URL de la imagen de portada..." className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-bold" />
                        </div>
                        <div className="w-full md:w-2/3 space-y-5 mt-4 md:mt-16">
                            <div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Título del Libro (TITULO)</label><input name="titulo" required className="w-full p-4 border-2 rounded-xl font-bold" /></div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">ISBN (ISBN)</label><input name="isbn" placeholder="978-x-xxx-xxxx-x" className="w-full p-4 border-2 rounded-xl font-bold" /></div><div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Año de publicación</label><input name="anio" type="number" placeholder="2026" className="w-full p-4 border-2 rounded-xl font-bold" /></div></div>
                            <div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Autor (ID_AUTOR)</label><input name="autor" required placeholder="Nombre del autor..." className="w-full p-4 border-2 rounded-xl font-bold" /></div>
                            <div className="grid grid-cols-2 gap-4 mb-6"><div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Categoría (ID_CATEGORIA)</label><select name="categoria" className="w-full p-4 border-2 rounded-xl font-bold">{categories.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}</select></div><div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Editorial (ID_EDITORIAL)</label><input name="editorial" placeholder="Ej. Editorial UTP" className="w-full p-4 border-2 rounded-xl font-bold" /></div></div>
                            <div className="flex gap-4 pt-6 border-t"><button type="button" onClick={() => setShowAddBookModal(false)} className="flex-1 py-4 border-2 text-gray-500 font-black rounded-xl uppercase tracking-widest text-xs">Descartar</button><button type="submit" className="flex-1 py-4 bg-[#1A1A1A] text-white font-black rounded-xl shadow-xl uppercase tracking-widest text-xs hover:bg-black">Insert Into Libros</button></div>
                        </div>
                    </form>
                </div>
            )}
    
    {/* --- NUEVO MODAL ADICIONAL: FORMULARIO PARA EDITAR LIBRO EXISTENTE --- */}
{showEditBookModal && bookToEdit && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        {/* Fondo oscuro desenfocado */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setShowEditBookModal(false)}
        ></div>
        
        {/* Formulario Principal de Edición */}
        <form 
            onSubmit={handleEditBookForm} 
            className="relative bg-white w-full max-w-4xl p-10 rounded-[2rem] shadow-2xl animate-pop-in text-left flex flex-col md:flex-row gap-10"
        >
            {/* Columna Izquierda: Vista previa e Imagen */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
                <h3 className="text-2xl font-black text-[#5D4037] mb-6 uppercase tracking-tighter w-full border-b pb-4">
                    Editar Libro
                </h3>
                <img 
                    src={bookToEdit.imagenUrl || bookToEdit.imagen_url || "https://unsplash.com"} 
                    className="w-full aspect-[2/3] object-cover rounded-2xl shadow-md mb-4 bg-gray-50 border"
                    alt="Portada actual"
                />
                <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 w-full text-left">URL de la Portada</label>
                <input 
                    name="imagenUrl" 
                    type="url" 
                    defaultValue={bookToEdit.imagenUrl || bookToEdit.imagen_url} 
                    className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-bold" 
                />
            </div>
            
            {/* Columna Derecha: Atributos a modificar */}
            <div className="w-full md:w-2/3 space-y-5 mt-4 md:mt-16">
                
                {/* ID oculto indispensable para saber a qué libro aplicarle el UPDATE en MySQL */}
                <input name="id" type="hidden" value={bookToEdit.id} />

                <div>
                    <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Título del Libro</label>
                    <input name="titulo" defaultValue={bookToEdit.titulo} required className="w-full p-4 border-2 rounded-xl font-bold" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">ISBN</label>
                        <input name="isbn" defaultValue={bookToEdit.isbn} className="w-full p-4 border-2 rounded-xl font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Año de publicación</label>
                        <input name="anio" type="number" defaultValue={bookToEdit.anio} className="w-full p-4 border-2 rounded-xl font-bold" />
                    </div>
                </div>
                
                <div>
                    <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Autor</label>
                    <input name="autor" defaultValue={bookToEdit.autor} required className="w-full p-4 border-2 rounded-xl font-bold" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Categoría</label>
                        <select name="categoria" defaultValue={bookToEdit.categoria} className="w-full p-4 border-2 rounded-xl font-bold bg-white">
                            {categories.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Editorial</label>
                        <input name="editorial" defaultValue={bookToEdit.editorial} className="w-full p-4 border-2 rounded-xl font-bold" />
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase text-blue-600 mb-1 block">Stock Unidades</label>
                        <input name="stock" type="number" min="0" defaultValue={bookToEdit.stock !== undefined ? bookToEdit.stock : 5} required className="w-full p-4 border-2 border-blue-200 focus:border-blue-500 rounded-xl font-black text-blue-600" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Estado Físico actual</label>
                    <select name="estado" defaultValue={bookToEdit.estado || 'Disponible'} className="w-full p-4 border-2 rounded-xl font-bold bg-white">
                        <option value="Disponible">Disponible</option>
                        <option value="Prestado">Prestado</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                </div>
                
                {/* Botonera de Envío */}
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

        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MainApp />);