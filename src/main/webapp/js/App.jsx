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
     const [stockFilter, setStockFilter] = useState("Todos");

     const [showTermsModal, setShowTermsModal] = useState(false); // 
     const [tiempoPrestamo, setTiempoPrestamo] = useState('3_dias'); // 
     const [auditLoanData, setAuditLoanData] = useState(null);

     const [categoriesList, setCategoriesList] = useState([]);
     const [searchCategoryQuery, setSearchCategoryQuery] = useState("");


     const [userPanelTab, setUserPanelTab] = useState('prestamos'); 
     const [adminSubView, setAdminSubView] = useState('overview');
     const [isCartOpen, setIsCartOpen] = useState(false);
     const [showAddBookModal, setShowAddBookModal] = useState(false);
     const [publicSubView, setPublicSubView] = useState('inicio'); // 'inicio' o 'info'

     const categories = [
         { id: 1, name: 'Historias', icon: '📜' }, { id: 2, name: 'Novelas', icon: '📘' },
         { id: 3, name: 'Revistas', icon: '📰' }, { id: 4, name: 'Educativos', icon: '🎓' },
         { id: 5, name: 'Poesía', icon: '🖋️' }, { id: 6, name: 'Cuentos', icon: '📖' },
         { id: 7, name: 'Teatro', icon: '🎭' }, { id: 8, name: 'Religiosos', icon: '⛪' }
     ];
     const [analyticsData, setAnalyticsData] = useState(null);
     const [booksList, setBooksList] = useState([]);
     const [allLoans, setAllLoans] = useState([]);
     const [cart, setCart] = useState([]);
     const [fines, setFines] = useState([]);
         // 🛑 VARIABLES DE CONTROL DE COPÍAS ASIGNADAS AL ENTORNO GLOBAL
     const [showEjemplaresModal, setShowEjemplaresModal] = useState(false);
     const [bookToEjemplares, setBookToEjemplares] = useState(null);
     const [ejemplaresList, setEjemplaresList] = useState([]);

    const handleAbrirModalEjemplares = (libro) => {
        setBookToEjemplares(libro);
        setShowEjemplaresModal(true);
        cargarEjemplaresDesdeBD(libro.id);
    };



const cargarDatosDesdeBD = () => {
        // 1. Canal asíncrono para cargar el catálogo general de libros
        fetch(`${API_BASE_URL}/api/libros`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setBooksList(data);
            })
            .catch(err => console.error("Error al mapear catálogo de libros: ", err));
        
        // 2. Canal asíncrono para cargar el historial de préstamos y DNI
        fetch(`${API_BASE_URL}/api/prestamos/listar`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllLoans(data.map(p => {
                        const partesToken = p.codigoRecojoCifrado ? p.codigoRecojoCifrado.split("|") : ["", ""];
                        
                        return { 
                            id: p.id, 
                            bookId: p.libroId || p.libro_id, 
                            title: p.tituloLibro || p.titulo_libro || "Libro", 
                            user: p.nombreUsuario || p.nombre_usuario || "Estudiante", 
                            date: p.fechaPrestamo || p.fecha_prestamo, 
                            dueDate: p.fechaVencimiento || p.fecha_vencimiento, 
                            status: p.estado,
                            fechaEntrega: p.fechaEntrega || p.fecha_entrega, 
                            fechaDevolucionReal: p.fechaDevolucionReal || p.fecha_devolucion_real,
                            ejemplarCodigo: p.ejemplarCodigo || p.ejemplar_codigo || "N/A",
                            //TRAEMOS LOS VALORES REALES DE BASE DE DATOS
                            codigoRecojoCifrado: partesToken[0] || "",
                            dni: partesToken[1] || "72410958" 
                        };
                    }));
                }
            })
            .catch(err => console.error("Error al mapear préstamos: ", err));
            
        // 3. Canal asíncrono alineado con los alias reales de MultaServlet (usuario, libro)
        fetch(`${API_BASE_URL}/api/multas`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFines(data.map(m => ({
                        id: m.id,
                        user: m.user || "",       
                        book: m.book || "Recurso", 
                        reason: m.reason || "Infracción", 
                        amount: typeof m.amount === 'number' ? m.amount : parseFloat(m.amount || 0),
                        status: m.status || "Pendiente",
                        date: m.date || "Hoy"
                    })));
                }
            })
            .catch(err => console.error("Error de sincronización en red de multas: ", err));
    
        // Jala las categorías reales desde tu CategoriaServlet
        fetch(`${API_BASE_URL}/api/categorias`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategoriesList(data);
            })
            .catch(() => {});

        // 🚀 4. CANAL ANALÍTICO INYECTADO: Sincroniza el JSON de ReporteServlet directo de MySQL
        fetch(`${API_BASE_URL}/api/reportes/dashboard`)
            .then(res => res.json())
            .then(data => {
                if (data) setAnalyticsData(data);
            })
            .catch(err => console.error("Error al sincronizar dashboard de base de datos: ", err));
    };

    // 🟢 TODAS LAS FUNCIONES AGRUPADAS ARRIBA:
    const cargarEjemplaresDesdeBD = (idLibro) => {
        fetch(`${API_BASE_URL}/api/ejemplares?libroId=${idLibro}`)
            .then(res => res.json())
            .then(setEjemplaresList)
            .catch(() => {});
    };

    const handleEditEjemplarForm = (idEjemplar, nuevaUbicacion, nuevoEstado, nuevoAnio) => {
        fetch(`${API_BASE_URL}/api/ejemplares`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: idEjemplar,
                ubicacion: nuevaUbicacion,
                estado: nuevoEstado,
                anioImpresion: nuevoAnio
            })
        })
        .then(res => {
            if (!res.ok) throw new Error();
            alert("¡Ejemplar actualizado con éxito!");
            cargarEjemplaresDesdeBD(bookToEjemplares.id);
            cargarDatosDesdeBD(); 
        })
        .catch(() => alert("Error al actualizar el ejemplar."));
    };
    // Agrupado junto a las funciones de su misma categoría
       // 🛑 OPTIMIZADO: Actualización asíncrona fluida sin recargar la pantalla (Punto 2)
    const handleCrearEjemplar = (codigo, ubicacion, anio) => {
        if(!codigo || !ubicacion || !anio) { alert("Completa todos los campos"); return; }
        
        fetch(`${API_BASE_URL}/api/ejemplares`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                libroId: parseInt(bookToEjemplares.id),
                codigoEjemplar: codigo.trim(),
                ubicacion: ubicacion.trim(),       
                estado: 'Disponible',
                anioImpresion: anio.trim()
            })
        })
        .then(res => {
            if (!res.ok) throw new Error();
            alert("¡Nuevo ejemplar agregado al estante!");
         
            // Esto dibuja las filas blancas abajo instantáneamente sin parpadear la pantalla
            cargarEjemplaresDesdeBD(bookToEjemplares.id); 
            // Recargamos el inventario general del panel por debajo en silencio
            cargarDatosDesdeBD(); 
        })
        .catch(() => alert("Error al guardar. Verifica los datos en la consola de NetBeans."));
    };
       // 🔵 LOS HOOKS DE CARGA AL FINAL DE TU APP.JSX:
     useEffect(() => {
        cargarDatosDesdeBD(); 
        // Consulta el servidor cada 4 segundos en segundo plano
        const intervaloEscuchaLive = setInterval(() => {
            cargarDatosDesdeBD();
        }, 4000);

        return () => clearInterval(intervaloEscuchaLive); // Limpieza de memoria al apagar
    }, []);
    
    // 'ejemplaresList' al final del arreglo de dependencias
    useEffect(() => { 
        if (window.lucide) window.lucide.createIcons(); 
    }, [view, selectedCategory, isCartOpen, adminSubView, showAddBookModal, cart, userType, allLoans, userPanelTab, booksList, fines, ejemplaresList]);

    const handleLogout = () => { 
        localStorage.clear();       
        setUserType('visitante');   
        setView('landing');         
        window.location.reload(); 
    };

        // 🛑 CONTROL DE TOPES: Máximo 3 unidades en reserva activa por estudiante (Punto 3)
    const addToCart = (book) => { 
        const stockActual = book.stock !== undefined ? book.stock : 5; 
        
        // 1. Validación de cuota física en el carrito actual
        if (cart.length >= 3) {
            alert("Tope alcanzado: No puedes solicitar más de 3 unidades en un mismo pedido corporativo.");
            return;
        }

        // 2. Validación de reservas pendientes históricas ya registradas en la Base de Datos
        const reservasActivasUsuario = allLoans.filter(l => 
            l.user.toLowerCase() === `${userData.nombre} ${userData.apellido}`.trim().toLowerCase() && 
            (l.status === 'Pendiente' || l.status === 'Activo')
        ).length;

        if (reservasActivasUsuario + cart.length >= 3) {
            alert(`Posees ${reservasActivasUsuario} libros reservados/activos en tu cuenta. Solo puedes solicitar ${3 - reservasActivasUsuario} más.`);
            return;
        }

        // Si pasa los controles de cuota, se añade de forma tradicional
        if (stockActual > 0 && !cart.find(i => i.id === book.id)) { 
            setCart([...cart, book]); 
            setIsCartOpen(true); 
        } 
    };

    // Envía el tiempo de préstamo elegido para la asignación criptográfica en Java
       const handleConfirmLoan = () => {
        if (cart.length === 0) return;
        
        // Creamos las promesas inyectando la variable de tiempo elegida en el select
        const promesas = cart.map(item => 
            fetch(`${API_BASE_URL}/api/prestamos`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    libroId: item.id, 
                    titulo: item.titulo, 
                    usuario: `${userData.nombre} ${userData.apellido}`.trim(),
                    tiempoPrestamo: tiempoPrestamo //  Enviamos3 dias 5 dias o 1 semana
                })
            })
        );
        
        Promise.all(promesas)
            .then(respuestas => {
                // Evaluamos si alguna petición fue rebotada por falta de stock o strikes
                const algunaFalla = respuestas.some(res => !res.ok);
                if (algunaFalla) {
                    alert("Aviso: Algunos títulos no pudieron procesarse. Verifica tu cuota de 3 libros o el stock físico en estantes.");
                } else {
                    alert("¡Pedido solicitado con éxito! Se ha generado tu código de recojo único cifrado.");
                }
                
                setCart([]); 
                setIsCartOpen(false); 
                cargarDatosDesdeBD(); 
                setView('user-panel'); 
                setUserPanelTab('prestamos'); 
            })
            .catch(() => alert("Error de red al procesar la reserva."));
    };

    const approveLoan = (loanId) => fetch(`${API_BASE_URL}/api/prestamos/estado`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({prestamoId: loanId, nuevoEstado: 'Activo', libroId: 0})
    }).then(() => {
        alert("¡Recurso entregado con éxito en mostrador!");
        cargarDatosDesdeBD(); // 🚀 Refresca el panel del alumno en vivo sin recargar F5
    });
       const ejecutarDevolucionConMultas = (loanId, bookId, evaluacion, monto, motivo) => {
        fetch(`${API_BASE_URL}/api/prestamos/estado`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                prestamoId: loanId, 
                nuevoEstado: 'Devuelto', 
                libroId: bookId,
                evaluacion: evaluacion,
                montoMulta: parseFloat(monto),
                descripcion: motivo
            }) 
        }).then(() => { 
            alert("¡Procesamiento de Almacén Exitoso! Inventarios y multas actualizados.");
            setAuditLoanData(null); 
            
            // REFRESH AUTOMÁTICO EN CASCADA: Actualiza todas las vistas de alumnos y dashboards en vivo
            cargarDatosDesdeBD(); 
        }).catch(() => alert("Error de red."));
    };
    const payFine = (multaId) => fetch(`${API_BASE_URL}/api/multas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ multaId: multaId }) }).then(() => { alert("¡Multa marcada como pagada en el sistema!"); cargarDatosDesdeBD(); });
    
    // CANCELACIÓN ASÍNCRONA POR EXCESO DE TIEMPO (48H)
   
    const handleCancelarReservaExpirada = (loanId, bookId) => {
        if (!confirm("¿Confirmar cancelación del pedido por exceder el límite de 48 horas de recojo?")) return;

        fetch(`${API_BASE_URL}/api/prestamos/estado`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                prestamoId: loanId, 
                nuevoEstado: 'Cancelado', 
                libroId: bookId           
            }) 
        }).then(() => { 
            alert("Pedido cancelado con éxito. Unidad liberada para el catálogo general.");
            cargarDatosDesdeBD(); 
        });
    };
       const handleCrearCategoria = (nombre, descripcion, estado) => {
        fetch(`${API_BASE_URL}/api/categorias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, estado })
        }).then(() => {
            alert(`¡Categoría "${nombre}" guardada con éxito en MySQL!`);
            cargarDatosDesdeBD(); // 🔄 Recarga los catálogos relacionales en vivo
        }).catch(() => alert("Error de red al registrar la categoría."));
    };

    const handleConmutarEstadoCategoria = (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
        fetch(`${API_BASE_URL}/api/categorias/estado`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nuevoEstado })
        }).then(() => {
            alert(`Estado actualizado a: ${nuevoEstado.toUpperCase()}. Todos sus libros asociados se han modificado en la vista pública.`);
            cargarDatosDesdeBD(); // 🔄 Oculta o muestra los libros en caliente del alumno
        }).catch(() => alert("Error de red al cambiar el estado de la categoría."));
    };

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

    
    
     const handleAddNewBookForm = (e) => { 
        e.preventDefault(); 
        const formData = new FormData(e.target); 
        
        // Buscamos el objeto de la categoría en base al texto seleccionado en el formulario
        const textoCategoriaSeleccionada = formData.get('categoria');
        const catEncontrada = categoriesList.find(c => 
            c.name && c.name.trim().toLowerCase() === textoCategoriaSeleccionada.trim().toLowerCase()
        );
        
        // Si por alguna razón no lo encuentra, le asigna la ID 1 (Historias) por defecto
        const idCategoriaFinal = catEncontrada ? catEncontrada.id : 1;

        fetch(`${API_BASE_URL}/api/libros`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                titulo: formData.get('titulo'), 
                isbn: formData.get('isbn'), 
                autor: formData.get('autor'), 
                
                // 🚀 TRUCO MAESTRO: Enviamos tanto el ID numérico como el nombre para blindar ambos extremos del Servlet
                categoriaId: idCategoriaFinal, 
                categoria: textoCategoriaSeleccionada, 
                
                editorial: formData.get('editorial'), 
                anio: formData.get('anio'), 
                imagenUrl: formData.get('imagenUrl') || "https://images.unsplash.com/photo-1543004218-ee141104308d?w=300" 
            }) 
        }).then(() => { 
            alert("¡Libro registrado con éxito en el sistema relacional!"); 
            setShowAddBookModal(false); 
            cargarDatosDesdeBD(); // Forzamos a limpiar los useMemo y re-renderizar el carrusel de novedades
        }).catch(() => alert("Error de red al intentar registrar el libro en el servidor.")); 
    };
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

        // Filtro multidimensional inteligente (Busca en Título, Autor, ISBN y filtra por Disponibilidad)
const filteredBooks = useMemo(() => {
        return booksList.filter(b => {
            if (!b || !b.titulo || !b.autor) return false;

            // 1. EVALUACIÓN DE BORRADO LÓGICO: Buscamos si la categoría de este libro está Inactiva
            const catAsociada = categoriesList.find(c => 
                c.name && b.categoria && c.name.trim().toLowerCase() === b.categoria.trim().toLowerCase()
            );
            
            // Si la categoría existe y su estado es Inactivo, ocultamos el libro de golpe
            if (catAsociada && (catAsociada.estado === 'Inactivo' || catAsociada.estado === 'INACTIVO')) {
                return false;
            }

            // 2. Filtro por Texto Inteligente (Busca en Título, Autor o ISBN al mismo tiempo)
            const busquedaAlineada = searchQuery.toLowerCase().trim();
            const cumpleTexto = busquedaAlineada === "" || 
                b.titulo.toLowerCase().includes(busquedaAlineada) || 
                b.autor.toLowerCase().includes(busquedaAlineada) ||
                (b.isbn && b.isbn.toLowerCase().includes(busquedaAlineada));

            // 3. Filtro por Categoría
            const cumpleCategoria = selectedCategory === "Todos" || b.categoria === selectedCategory;

            // 4. Filtro avanzado por Disponibilidad Real en Almacén
            const stockActual = b.stock !== undefined ? b.stock : 5;
            const cumpleStock = stockFilter === "Todos" || (stockFilter === "Disponibles" && stockActual > 0);

            return cumpleTexto && cumpleCategoria && cumpleStock;
        });
        // Dependencias del catálogo completo
    }, [searchQuery, selectedCategory, stockFilter, booksList, categoriesList]);
    // CARRUSEL DE NOVEDADES SINCRONIZADO: FILTRA INACTIVOS Y ORDENA LOS NUEVOS LIVE
    const nuevosLibros = useMemo(() => {
        // Use filteredBooks para que herede el borrado lógico y no muestre recursos deshabilitados
        return [...filteredBooks].reverse().slice(0, 4);
    }, [filteredBooks]);

    // Esta es la línea que ya tenías abajo y sirve de guía:
    const nombreCompletoActual = `${userData.nombre} ${userData.apellido}`.trim().toLowerCase();

    if (view === 'register') return <RegisterView handleRegisterUser={handleRegisterUser} setView={setView} />;
    if (view === 'login') return <LoginView handleLogin={handleLogin} setView={setView} />;

    return (
         <div className="min-h-screen flex flex-col">
            <nav className="bg-[#F5F1E3] border-b border-[#D4CDB3] sticky top-0 z-50 h-16 flex items-center px-8 shadow-sm">
                <div className="flex items-center gap-2 cursor-pointer mr-auto" onClick={() => { if(userType === 'admin'){ setView('admin'); setAdminSubView('overview'); } else { setView('landing'); if(typeof setPublicSubView === 'function') setPublicSubView('inicio'); } }}><i data-lucide="library" className="text-[#8B7355] w-8 h-8"></i><span className="font-bold text-[#5D4037] uppercase">BENP</span></div>
                <div className="flex items-center space-x-6">
                    
                    {/* 🚀 BOTÓN 1: INICIO (Limpio y acoplado a la sub-vista) */}
                    {userType !== 'admin' && (
                        <button 
                            type="button"
                            onClick={() => { setView('landing'); if(typeof setPublicSubView === 'function') setPublicSubView('inicio'); }} 
                            className={"text-xs font-black uppercase tracking-wider cursor-pointer transition-colors " + (publicSubView === 'inicio' ? "text-[#8B7355] underline underline-offset-4" : "text-[#5D4037] hover:text-[#8B7355]")}
                        >
                            Inicio
                        </button>
                    )}

                    {/* 🚀 BOTÓN 2: INFO (Inyectado al costado en mayúsculas estables) */}
                    {userType !== 'admin' && (
                        <button 
                            type="button"
                            onClick={() => { setView('landing'); if(typeof setPublicSubView === 'function') setPublicSubView('info'); }} 
                            className={"text-xs font-black uppercase tracking-wider cursor-pointer transition-colors " + (publicSubView === 'info' ? "text-[#8B7355] underline underline-offset-4" : "text-[#5D4037] hover:text-[#8B7355]")}
                        >
                            Info
                        </button>
                    )}

                    {userType === 'estudiante' && <button onClick={() => setView('user-panel')} className="text-sm font-bold text-[#5D4037] bg-white px-4 py-2 rounded-xl border flex items-center gap-1 cursor-pointer"><i data-lucide="user" className="w-4 h-4"></i>{userData.apodo}</button>}
                    {userType !== 'admin' && <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#5D4037] cursor-pointer"><i data-lucide="shopping-bag" className="w-5 h-5"></i>{cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}</button>}
                    {userType === 'visitante' ? <button onClick={() => setView('login')} className="px-5 py-2 bg-[#8B7355] text-white rounded-xl text-xs font-black cursor-pointer">INGRESAR</button> : <button onClick={handleLogout} className="text-xs font-black text-red-500 flex items-center gap-1 cursor-pointer"><i data-lucide="log-out" className="w-4 h-4"></i>SALIR</button>}
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
    payFine={payFine} 
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
    categories={categories}
    filteredBooks={filteredBooks}
    handleAbrirModalEditar={handleAbrirModalEditar}
    stockFilter={stockFilter}
    setStockFilter={setStockFilter}
    showEjemplaresModal={showEjemplaresModal}
    setShowEjemplaresModal={setShowEjemplaresModal}
    bookToEjemplares={bookToEjemplares}
    ejemplaresList={ejemplaresList}
    handleAbrirModalEjemplares={handleAbrirModalEjemplares}
    handleEditEjemplarForm={handleEditEjemplarForm}
    handleCancelarReservaExpirada={handleCancelarReservaExpirada}
    setAuditLoanData={setAuditLoanData}
    categoriesList={categoriesList}
    searchCategoryQuery={searchCategoryQuery}
    setSearchCategoryQuery={setSearchCategoryQuery}
    handleCrearCategoria={handleCrearCategoria}
    handleConmutarEstadoCategoria={handleConmutarEstadoCategoria}
    setView={setView}
    analyticsData={analyticsData}
/>
) : view === 'user-panel' ? (

                    <div className="max-w-6xl mx-auto p-16 text-left">
                        <button onClick={() => setView('landing')} className="flex items-center gap-2 text-[#8B7355] font-bold text-sm mb-6"><i data-lucide="arrow-left" className="w-4 h-4"></i> Volver al Catálogo</button>
                        <div className="flex justify-between items-end mb-12 border-b pb-8">
                            <div><h1 className="text-4xl font-black text-[#5D4037]">Mi Perfil Estudiante</h1></div>
                            <div className="flex bg-[#F5F1E3] p-1.5 rounded-2xl border">
                                <button onClick={() => setUserPanelTab('prestamos')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${userPanelTab === 'prestamos' ? 'bg-[#8B7355] text-white shadow-md' : 'text-[#8B7355]'}`}>Préstamos</button>
                                <button onClick={() => setUserPanelTab('deudas')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${userPanelTab === 'deudas' ? 'bg-[#8B7355] text-white shadow-md' : 'text-[#8B7355]'}`}>Deudas</button>
                                <button onClick={() => setUserPanelTab('perfil')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${userPanelTab === 'perfil' ? 'bg-[#8B7355] text-white shadow-md' : 'text-[#8B7355]'}`}>Mis Datos</button>
                            </div>
                        </div>

                        {userPanelTab === 'prestamos' ? (
                            <table className="w-full bg-white rounded-[2rem] border overflow-hidden shadow-sm">
                                <thead className="bg-[#F5F1E3] text-[10px] font-black text-[#8B7355] uppercase">
                                    <tr>
                                        <th className="p-5 text-left">Libro Solicitado</th>
                                        <th className="p-5 text-left">Ejemplar / Credencial Cifrada</th>
                                        <th className="p-5 text-left">Línea de Tiempos</th>
                                        <th className="p-5 text-left">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {allLoans.filter(l => l.user && l.user.trim().toLowerCase() === `${userData.nombre} ${userData.apellido}`.trim().toLowerCase()).map(loan => (
                                        <tr key={loan.id} className="text-sm">
                                            <td className="p-5 font-bold text-[#5D4037]">{loan.title}</td>
                                            
                                            {/* 🔐 INTEGRADO - PUNTO 5: Visualización de Criptografía SHA-256 para el Retiro */}
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">Copia: <span className="text-blue-600 font-mono font-bold">{loan.ejemplarCodigo || "Asignando..."}</span></span>
                                                    {loan.status === 'Pendiente' ? (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-black text-xs rounded-lg border border-blue-200 tracking-wider shadow-inner animate-pulse">
                                                                🔐 {loan.codigoRecojoCifrado || "GENERANDO"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-green-600 uppercase">Verificado en Mostrador</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <CountdownTimer targetDate={loan.dueDate} status={loan.status} />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Límite: {loan.dueDate}</span>
                                                </div>
                                            </td>
                                            
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${loan.status === 'Pendiente' ? 'bg-orange-50 text-orange-700 border border-orange-100' : loan.status === 'Cancelado' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {allLoans.filter(l => l.user && l.user.trim().toLowerCase() === `${userData.nombre} ${userData.apellido}`.trim().toLowerCase()).length === 0 && (
                                        <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold italic">No registras solicitudes de préstamos activos en MySQL.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        
                      ) : userPanelTab === 'deudas' ? (
                    <table className="w-full bg-white rounded-[2rem] border overflow-hidden shadow-sm text-left">
                        <thead className="bg-[#F5F1E3] border-b text-[10px] font-black text-[#8B7355] uppercase">
                            <tr>
                                <th className="p-5 text-left">Libro Relacionado</th>
                                <th className="p-5 text-left">Motivo de Infracción</th>
                                <th className="p-5 text-left">Monto</th>
                                <th className="p-5 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {fines && fines.filter(f => f.user && f.user.trim().toLowerCase() === `${userData.nombre} ${userData.apellido}`.trim().toLowerCase()).map(multa => {
                                // 🌟 PROTECCIÓN ELÁSTICA: Extraemos de forma segura el título y la descripción
                                const tieneSeparador = multa.reason && multa.reason.includes(":");
                                const tituloMotivo = tieneSeparador ? multa.reason.split(":")[0] : "Infracción de Almacén";
                                const descDetallada = tieneSeparador ? multa.reason.split(":").slice(1).join(":") : (multa.reason || "Sanción aplicada por administración.");
                                const montoNumerico = typeof multa.amount === 'number' ? multa.amount : parseFloat(multa.amount || 0);

                                return (
                                    <tr key={multa.id} className="text-sm hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-bold text-[#5D4037]">{multa.book || 'N/A (Recurso)'}</td>

                                        {/* 🔎 Desglose visual premium con tarjeta punteada gris */}
                                        <td className="p-5 max-w-sm">
                                            <div className="flex flex-col gap-1 text-left">
                                                <span className="font-extrabold text-gray-700 uppercase text-[11px]">
                                                    {tituloMotivo}
                                                </span>
                                                <p className="text-[11px] text-gray-400 font-medium italic bg-gray-50 p-2.5 rounded-xl border border-dashed border-gray-200 leading-relaxed">
                                                    {descDetallada}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="p-5 font-black text-red-500">S/ {montoNumerico.toFixed(2)}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                multa.status === 'Pendiente' || multa.status === 'PENDIENTE'
                                                    ? 'bg-red-50 text-red-700 border border-red-100' 
                                                    : 'bg-green-50 text-green-700 border border-green-100'
                                            }`}>
                                                {multa.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {(!fines || fines.filter(f => f.user && f.user.trim().toLowerCase() === `${userData.nombre} ${userData.apellido}`.trim().toLowerCase()).length === 0) && (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-green-600 font-bold italic bg-[#FDFBF7]">
                                        🍀 No registras multas ni deudas activas en MySQL. ¡Excelente historial!
                                    </td>
                                </tr>
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
                {/*bOTON DE RETORNO*/}
                                 <header className="bg-[#E2D6B2] py-20 px-4 text-center relative">
                                
                                {/* Barra de Control Superior para el Administrador */}
                                {userType === 'admin' && (
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-white/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/40 shadow-sm animate-fade-in">
                                        <div className="flex items-center gap-2 px-4">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-[10px] font-black uppercase text-[#5D4037] tracking-wider">Modo Inspector Admin</span>
                                        </div>
                                        
                                        {/* 🎯 BOTÓN CORREGIDO: Posicionado arriba al costado superior derecho y funcional */}
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (typeof setView === 'function') {
                                                    setView('admin'); // Setea el estado exacto de tu ruta para retornar
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-[#5D4037] text-[#F5F1E3] hover:bg-[#8B7355] font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-md tracking-wider flex items-center gap-1.5 transform active:scale-95"
                                        >
                                            💼 Volver al Panel
                                        </button>
                                    </div>
                                )}

                                <h1 className="text-5xl font-black text-[#5D4037] uppercase pt-6">Biblioteca Digital</h1>
                                <div className="relative max-w-2xl mx-auto mt-6">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por título o autor..." 
                                        className="w-full pl-6 pr-6 py-5 rounded-3xl outline-none shadow-xl text-lg bg-white" 
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)} 
                                    />
                                </div>
                            </header>
                            {/*VISTA DE LA INFO EN LA CABECERA COMO EL HORARIO Y LA UBICACION*/}
                            {publicSubView === 'info' ? (
                                
                                /* 🚀 VISTA EXCLUSIVA: TÉRMINOS Y HORARIOS INSTITUCIONALES */
                                <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in text-left space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#5D4037] uppercase tracking-tight flex items-center gap-2">
                                            ⚖️ Reglamento Interno y Horarios de Atención
                                        </h2>
                                        <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">Módulo de Información Institucional BENP</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* PANEL HORARIOS POR TURNOS */}
                                        <div className="bg-[#F5F1E3] p-8 rounded-[2rem] border border-[#D4CDB3] shadow-sm space-y-4">
                                            <h3 className="text-xs font-black uppercase text-[#8B7355] tracking-widest border-b border-[#D4CDB3] pb-2 flex items-center gap-2">
                                                🕒 Horario de Atención en la BIBLIOTECA
                                            </h3>
                                            <div className="space-y-3 font-bold text-xs text-gray-600">
                                                <div className="bg-white p-4 rounded-xl border flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-black text-[#8B7355]">Turno Mañana / Tarde:</span>
                                                    <span className="text-[#5D4037] text-sm font-black">7:30 am a 2:45 pm</span>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-black text-[#8B7355]">Turno Tarde / Noche:</span>
                                                    <span className="text-[#5D4037] text-sm font-black">3:00 pm a 10:00 pm</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2 py-1 text-[#8B7355]">
                                                    <span>📆 Calendario Semanal:</span>
                                                    <span className="font-black uppercase text-[10px] bg-white px-2 py-1 rounded-md border border-[#D4CDB3]">Lunes a Viernes</span>
                                                </div>
                                                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 font-black uppercase text-[9px] tracking-wider text-center">
                                                    🚫 Los feriados no hay atención en mostrador
                                                </div>
                                            </div>
                                        </div>

                                        {/* PANEL UBICACIÓN */}
                                        <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-[#E2D6B2] shadow-sm flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <h3 className="text-xs font-black uppercase text-[#8B7355] tracking-widest border-b pb-2 flex items-center gap-2">
                                                    📍 Coordenadas del Módulo Central
                                                </h3>
                                                <div className="bg-gray-50 p-4 rounded-xl border text-xs font-bold text-gray-600 space-y-2">
                                                    <p className="flex items-center gap-2 text-[#5D4037] font-black">🏢 Sede Principal BENP</p>
                                                    <p className="text-[#5D4037] font-extrabold text-sm">Calle Emiliano Niño Nª 241 y Calle San Jose</p>
                                                </div>
                                            </div>
                                            <div className="bg-[#F5F1E3]/40 p-4 rounded-xl border text-[11px] font-medium text-gray-400 italic text-center mt-4">
                                                Es responsabilidad del estudiante revisar el Control Regulatorio y cumplir con las políticas de recojo y devolución dentro de los plazos establecidos.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                
                                /* 🚀 VISTA EXCLUSIVA: CATÁLOGO ORIGINAL SANO DE LIBROS */
                                <>
                            
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
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b pb-6">
                                <h2 className="text-3xl font-black text-[#5D4037] uppercase">Catálogo General</h2>

                                {/* 🎯 CONTENEDOR INTEGRADO DE COMBO BOXES ALINEADOS A LA DERECHA */}
                                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                                    
                                    {/* 📦 COMBO BOX 1: FILTRO DE DISPONIBILIDAD (STOCK) */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-[#8B7355] uppercase tracking-wider pl-1">Disponibilidad</span>
                                        <select 
                                            value={stockFilter} 
                                            onChange={(e) => setStockFilter(e.target.value)} 
                                            className="p-3 border-2 border-[#E2D6B2] focus:border-[#8B7355] outline-none rounded-xl font-black text-xs bg-white text-gray-700 shadow-sm cursor-pointer min-w-[190px]"
                                        >
                                            <option value="Todos">📦 Mostrar Todo el Catálogo</option>
                                            <option value="Disponibles">🟢 Ocultar Libros Agotados</option>
                                        </select>
                                    </div>

                                    {/* COMBO BOX 2: FILTRO DE CATEGORÍAS RELACIONALES DINÁMICAS */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-[#8B7355] uppercase tracking-wider pl-1">Género / Especialidad</span>
                                        <select 
                                            value={selectedCategory} 
                                            onChange={(e) => setSelectedCategory(e.target.value)} 
                                            className="p-3 border-2 border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/20 outline-none rounded-xl font-black text-xs bg-white text-[#5D4037] shadow-md cursor-pointer min-w-[210px]"
                                        >
                                            <option value="Todos"> Todos los Géneros</option>
                                            
                                            {/* Mapea dinámicamente tu lista real de categorías traídas desde CategoriaServlet */}
                                            {categoriesList && categoriesList.map(cat => (
                                                <option key={cat.id || cat.name} value={cat.name}>
                                                    📁 {cat.name.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                </div>
                            </div>

                            {/* GRILLA DE TARJETAS DE LIBROS COMPATIBLE */}
                            <div className="grid grid-cols-4 gap-10">
                                {filteredBooks.map(book => {
                                    const stockActual = book.stock !== undefined ? book.stock : 5;
                                    return (
                                    <div key={book.id} className="bg-white rounded-[2.5rem] overflow-hidden border shadow-sm flex flex-col h-[520px] hover:shadow-md transition-shadow">
                                        <img src={book.imagenUrl} className="w-full h-72 object-cover" />
                                        <div className="p-6 flex flex-col flex-grow text-left">
                                            <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-black text-[#8B7355] uppercase bg-[#F5F1E3] px-2 py-1 rounded">{book.categoria}</span><span className={`text-[10px] font-black px-2 py-1 rounded-full ${stockActual > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>STOCK: {stockActual}</span></div>
                                            <h3 className="text-lg font-extrabold text-[#5D4037] line-clamp-2">{book.titulo}</h3>
                                            <p className="text-gray-400 text-xs mt-1">por {book.autor}</p>
                                            <button disabled={stockActual <= 0} onClick={() => { if(userType === 'visitante') setView('login'); else addToCart(book); }} className={`w-full py-4 text-white font-black rounded-2xl text-xs mt-auto transition-all cursor-pointer ${stockActual > 0 ? 'bg-[#8B7355] hover:bg-[#6F5A43]' : 'bg-gray-300 cursor-not-allowed'}`}>{stockActual > 0 ? 'RESERVAR LIBRO' : 'AGOTADO'}</button>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </section>  
                         </>
                            )}
                       
                       {showTermsModal && (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Fondo oscuro con desenfoque de fondo */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowTermsModal(false)}></div>
        
        {/* Tarjeta del Formulario de Consentimiento */}
        <div className="relative bg-white w-full max-w-xl p-8 rounded-[2rem] shadow-2xl animate-pop-in text-left flex flex-col gap-6">
            <div className="border-b pb-3">
                <h3 className="text-xl font-black text-[#5D4037] uppercase tracking-tight flex items-center gap-2">
                    ⚖️ Términos y Condiciones del Préstamo
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Sistema de Biblioteca BENP - Control Regulatorio</p>
            </div>

            {/* Las 4 Normas solicitadas de forma milimétrica */}
            <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border text-xs font-bold text-gray-600 max-h-[42vh] overflow-y-auto leading-relaxed">
                <div className="flex gap-2.5 items-start">
                    <span className="text-red-500 font-black text-sm">1.</span>
                    <p>Si no entrega el recurso en el tiempo establecido de devolución, se le aplicará una <span className="text-red-600 font-black">multa administrativa fija de S/ 15.00</span> en su cuenta institucional.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                    <span className="text-red-500 font-black text-sm">2.</span>
                    <p>Si entrega el ejemplar físico en mal estado, mutilado o vandalizado, se generará una penalización automática por <span className="text-red-600 font-black">infracción de daño de S/ 50.00</span>.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                    <span className="text-blue-600 font-black text-sm">3.</span>
                    <p>La garantía obligatoria que deberá depositar en el mostrador para retirar sus libros físicos será estrictamente su <span className="text-blue-600 font-black">DNI físico original</span>.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                    <span className="text-amber-600 font-black text-sm">4.</span>
                    <p>El horario de atencion es de <span className="text-amber-600 font-black">8:00 am - 5:00pm</span>. Pasado el horario no se realiza atencion para nadie  <span className="text-red-600 font-black">midan su tiempo con antelación</span></p>
                </div>
            </div>

            {/* Botonera Inferior de Aceptación */}
            <div className="flex gap-3 border-t pt-4">
                <button 
                    type="button" 
                    onClick={() => setShowTermsModal(false)}
                    className="flex-1 py-3.5 border-2 text-gray-500 font-black rounded-xl uppercase text-xs tracking-wider hover:bg-gray-50 transition-colors"
                >
                    Descartar Pedido
                </button>
                <button 
                    type="button"
                    onClick={() => {
                        setShowTermsModal(false);
                        handleConfirmLoan(); // Dispara la función original de red que conecta con Java
                    }}
                    className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-md uppercase text-xs tracking-wider transition-all duration-200 transform active:scale-95"
                >
                    Estoy de Acuerdo
                </button>
            </div>
        </div>
    </div>
)}
            </React.Fragment>
                )}
            </main>

           
            {isCartOpen && (
                <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#FDFBF7] shadow-2xl border-l border-[#E2D6B2] z-[150] p-8 flex flex-col text-left animate-slide-in">
                    
                    {/* Cabecera de la Canasta */}
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h3 className="text-xl font-black text-[#5D4037] uppercase tracking-tight">Tu Reserva</h3>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                    </div>

                    {/* Listado de Obras Añadidas */}
                    <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 relative">
                                <img src={item.imagenUrl || item.imagen_url} className="w-16 h-20 object-cover rounded-xl" />
                                <div className="flex-1">
                                    <h4 className="font-extrabold text-[#5D4037] text-sm leading-tight">{item.titulo}</h4>
                                    <p className="text-xs text-gray-400 italic mt-0.5">por {item.autor}</p>
                                </div>
                                <button 
                                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-gray-400 font-bold italic">Tu canasta de solicitud está vacía.</div>
                        )}
                    </div>

                    {/* Pie Regulado Libre de Tarifas Monetarias */}
                    <div className="border-t pt-4 space-y-4 mt-auto">
                        <div className="bg-[#F5F1E3] p-4 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="text-[10px] font-black uppercase text-[#8B7355] tracking-wider mb-1">
                                    Tiempo de Préstamo
                                </label>
                                <select 
                                    value={tiempoPrestamo} 
                                    onChange={(e) => setTiempoPrestamo(e.target.value)} 
                                    className="bg-transparent font-black text-sm text-[#5D4037] outline-none cursor-pointer w-full"
                                >
                                    <option value="3_dias">⏳ 3 Días Máximo</option>
                                    <option value="5_dias">⏳ 5 Días Máximo</option>
                                    <option value="1_semana">⏳ 1 Semana Máxima</option>
                                </select>
                            </div>
                            <div className="text-right flex flex-col justify-center">
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-black rounded-xl text-[9px] uppercase border border-blue-100 shadow-inner inline-block whitespace-nowrap">
                                   🛡️ Garantía: DNI Físico
                                </span>
                            </div>
                        </div>

                        {/* Botón de Confirmación de Solicitud */}
                        <button 
                            type="button"
                            disabled={cart.length === 0}
                            onClick={() => {
                                setIsCartOpen(false); // Cierra la barra lateral limpia
                                setShowTermsModal(true); // Invoca de forma directa al modal de consentimiento
                            }} 
                            className={`w-full py-4 font-black rounded-2xl shadow-xl uppercase tracking-widest text-xs transition-all transform active:scale-[0.98] ${
                                cart.length > 0 
                                    ? 'bg-[#8B7355] hover:bg-[#6F5A43] text-white cursor-pointer' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            Confirmar Solicitud de Préstamo
                        </button>
                    </div>

                </div>
            )}


    {/* MODAL INTERACTIVO: FORMULARIO DE AUDITORÍA Y CONTROL DE PENALIZACIONES (CORREGIDO) */}
{auditLoanData && (() => {
    let checkFecha = null; 
    let checkEstado = null; 
    let textMotivo = null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAuditLoanData(null)}></div>
            
            <div className="relative bg-white w-full max-w-xl p-8 rounded-[2rem] shadow-2xl animate-pop-in text-left flex flex-col gap-5">
                <div className="border-b pb-3">
                    <h3 className="text-xl font-black text-[#5D4037] uppercase tracking-tight">🔎 Auditoría de Devolución</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Recurso: {auditLoanData.title}</p>
                </div>

                {/* Formulario de Evaluación */}
                <div className="space-y-5">
                    {/* Botonera de Selección de Estado de Entrada */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={() => {
                                // 🌟 Si está impecable, salta el panel e inyecta directo los valores base a tu método
                                ejecutarDevolucionConMultas(auditLoanData.id, auditLoanData.bookId, "Buen_Estado", 0, "Devolución ordinaria en buen estado físico.");
                            }}
                            className="p-4 bg-green-50 text-green-700 font-black rounded-2xl border-2 border-green-200 uppercase text-xs tracking-wider text-center hover:bg-green-100 transition-all cursor-pointer"
                        >
                            🟢 Buen Estado
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                // Remueve la clase secreta de Tailwind para abrir el cajón de infracciones
                                const f = document.getElementById('panel_multas_coactivas');
                                if(f) f.classList.remove('hidden');
                            }}
                            className="p-4 bg-red-50 text-red-700 font-black rounded-2xl border-2 border-red-200 uppercase text-xs tracking-wider text-center hover:bg-red-100 transition-all cursor-pointer"
                        >
                            🔴 Evaluar Daños / Retrasos
                        </button>
                    </div>

                    {/* Contenedor Desplegable de Infracciones */}
                    <div id="panel_multas_coactivas" className="hidden space-y-4 pt-2 border-t border-dashed animate-fade-in">
                        <label className="text-[10px] font-black uppercase text-[#8B7355] block">Seleccione las Infracciones Detectadas:</label>
                        
                        {/* Check 1: Fuera de fecha */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                            <input type="checkbox" id="chk_fecha" ref={el => { checkFecha = el; }} className="w-4 h-4 cursor-pointer" />
                            <label htmlFor="chk_fecha" className="text-xs font-bold text-gray-600 cursor-pointer flex-1">
                                📅 Fuera de Fecha Límite Establecida <span className="text-red-500 font-black ml-1">(Multa: S/ 15.00)</span>
                            </label>
                        </div>

                        {/* Check 2: Mal estado */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                            <input type="checkbox" id="chk_estado" ref={el => { checkEstado = el; }} className="w-4 h-4 cursor-pointer" />
                            <label htmlFor="chk_estado" className="text-xs font-bold text-gray-600 cursor-pointer flex-1">
                                💥 Copia Física en Mal Estado / Vandalizado <span className="text-red-500 font-black ml-1">(Multa: S/ 50.00)</span>
                            </label>
                        </div>

                        {/* Caja de Texto para la Descripción */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 block">Descripción Justificada del Historial de la Multa:</label>
                            <textarea 
                                ref={el => { textMotivo = el; }}
                                placeholder="Escriba los motivos detallados para que queden registrados en el historial de la biblioteca..."
                                className="w-full p-4 border-2 border-[#E2D6B2] rounded-2xl font-bold text-xs bg-white outline-none focus:border-[#8B7355] h-24 resize-none"
                            ></textarea>
                        </div>

                        {/* Botón de Emisión de Penalización */}
                        <button 
                            type="button"
                            onClick={() => {
                                let total = 0;
                                let motivos = [];
                                let estadoFisico = "Buen_Estado";

                                if (checkFecha && checkFecha.checked) { total += 15; motivos.push("Fuera de Fecha"); }
                                if (checkEstado && checkEstado.checked) { total += 50; motivos.push("Mal Estado"); estadoFisico = "Mal_Estado"; }
                                
                                const desc = textMotivo && textMotivo.value.trim() !== "" ? textMotivo.value.trim() : "Penalización acumulada en devolución";
                                const motivoFinalString = `Infracción (${motivos.join(" + ")}): ${desc}`;

                                if (total === 0) { alert("Marque al menos un motivo de multa o seleccione Buen Estado arriba."); return; }
                                
                                ejecutarDevolucionConMultas(auditLoanData.id, auditLoanData.bookId, estadoFisico, total, motivoFinalString);
                            }}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer"
                        >
                            ⚡ Generar Multa en Cuenta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
})()}
    
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
                            <div className="grid grid-cols-2 gap-4 mb-6"><div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Categoría (ID_CATEGORIA)</label><select name="categoria" className="w-full p-4 border-2 rounded-xl font-bold">{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div><label className="text-[10px] font-black uppercase text-[#8B7355] mb-1 block">Editorial (ID_EDITORIAL)</label><input name="editorial" placeholder="Ej. Editorial UTP" className="w-full p-4 border-2 rounded-xl font-bold" /></div></div>
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
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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