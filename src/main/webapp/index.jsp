<%-- 
    Document   : index.jsp
    Created on : 28 may 2026, 5:20:20 p.m.
    Author     : sacsi
--%>
<%@page contentType="text/html" pageEncoding="UTF-8" isELIgnored="true"%>
<% String contextPath = request.getContextPath(); %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gestión Bibliotecaria - BENP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8B7355; border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    </style>
</head>
<body class="bg-[#FFFDF5]">
    <div id="root"></div>
    <script>const API_BASE_URL = "<%= contextPath %>";</script>
    
    <script type="text/babel" src="<%= contextPath %>/js/Auth.jsx"></script>
    <script type="text/babel" src="<%= contextPath %>/js/AdminPanel.jsx"></script>
    <script type="text/babel" src="<%= contextPath %>/js/App.jsx"></script>
</body>

<footer class="bg-[#8B4515] text-white py-4 mt-10">
    <div class="text-center">
        <p>&copy; 2026 Sistema de Gestión Bibliotecaria BENP</p>
        <p class="text-sm">Todos los derechos reservados</p>
        <p class="text-sm">Los estudiante de UTP </p> 
    </div>
</footer>

</html>