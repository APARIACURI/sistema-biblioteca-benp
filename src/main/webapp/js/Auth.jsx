/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/reactjs.jsx to edit this template
 */
// --- VISTA DE REGISTRO ---
// ---  ---
const RegisterView = ({ handleRegisterUser, setView }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E3] p-4">
        <div className="bg-white w-full max-w-xl p-10 rounded-[3rem] shadow-2xl animate-pop-in">
            <h2 className="text-3xl font-black text-[#5D4037] mb-2 text-center">Nuevo Registro</h2>
            
            <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                <input name="nombre" required className="p-4 bg-gray-50 border rounded-2xl" placeholder="Nombre" />
                <input name="apellido" required className="p-4 bg-gray-50 border rounded-2xl" placeholder="Apellido" />
                <input name="correo" type="email" required className="md:col-span-2 p-4 bg-gray-50 border rounded-2xl" placeholder="correo@utp.edu.pe" />
                <input name="dni" required maxLength="8" className="p-4 bg-gray-50 border rounded-2xl" placeholder="DNI" />
                <input name="numero" required className="p-4 bg-gray-50 border rounded-2xl" placeholder="Celular" />
                
                {/*Marcador descriptivo con las exigencias de seguridad para guiar al usuario */}
                <input 
                    name="clave" 
                    type="password" 
                    required 
                    className="md:col-span-2 p-4 bg-gray-50 border-2 rounded-2xl" 
                    placeholder="Contraseña (Mín. 10 caracteres)" 
                />
                
                <button type="submit" className="md:col-span-2 py-4 bg-[#8B7355] text-white font-black rounded-2xl shadow-xl hover:bg-[#6F5A43]">CREAR CUENTA</button>
                <button type="button" onClick={() => setView('login')} className="md:col-span-2 text-gray-400 text-sm font-bold text-center hover:underline">Volver al ingreso</button>
            </form>
            
        </div>
    </div>
);


// --- VISTA DE LOGIN---
const LoginView = ({ handleLogin, setView }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#E2D6B2] p-4 text-center">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl animate-pop-in">
            <div className="bg-[#F5F1E3] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#8B7355] shadow-inner"><i data-lucide="shield-check" className="w-10 h-10"></i></div>
            <h2 className="text-3xl font-black text-[#5D4037] mb-8">Iniciar Sesión</h2>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
                <input name="correo" type="email" required className="w-full p-4 bg-gray-50 border-2 rounded-2xl" placeholder="Correo Electrónico" />
                
                {/* Cambiado name a "clave" y marcador limpio sin mezclar con DNI */}
                <input name="clave" type="password" required className="w-full p-4 bg-gray-50 border-2 rounded-2xl" placeholder="Contraseña" />
                
                <button type="submit" className="w-full py-4 bg-[#8B7355] text-white font-black rounded-2xl shadow-xl hover:bg-[#6F5A43]">INGRESAR</button>
                <div className="text-center pt-4 border-t border-gray-100 mt-4">
                    <button type="button" onClick={() => setView('register')} className="w-full py-4 border-2 border-[#8B7355] text-[#8B7355] font-black rounded-2xl hover:bg-[#F5F1E3]">REGISTRARSE</button>
                </div>
                <button type="button" onClick={() => setView('landing')} className="w-full text-gray-400 font-bold text-sm mt-2 text-center hover:underline">Volver al catálogo</button>
            </form>
        </div>
    </div>
);
