package com.benp.web;

import com.benp.servicio.LibroService;
import com.benp.servicio.MultaService;
import com.benp.servicio.PrestamoService;
import com.benp.servicio.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

// Panel de administracion renderizado en servidor con Thymeleaf + _layout.html
// (el resto del sitio sigue siendo la SPA de React consumiendo /api/**)
@Controller
@RequestMapping("/admin")
public class AdminViewController {

    private final LibroService libroService;
    private final UsuarioService usuarioService;
    private final PrestamoService prestamoService;
    private final MultaService multaService;

    public AdminViewController(LibroService libroService, UsuarioService usuarioService,
                                PrestamoService prestamoService, MultaService multaService) {
        this.libroService = libroService;
        this.usuarioService = usuarioService;
        this.prestamoService = prestamoService;
        this.multaService = multaService;
    }

    @GetMapping
    public String dashboard(Model model) {
        long prestamosActivos = prestamoService.listarTodos().stream()
                .filter(p -> "Activo".equals(p.getEstado())).count();
        long multasPendientes = multaService.listarTodos().stream()
                .filter(m -> "Pendiente".equals(m.getStatus())).count();

        model.addAttribute("totalLibros", libroService.listarTodos().size());
        model.addAttribute("totalUsuarios", usuarioService.listarTodos().size());
        model.addAttribute("prestamosActivos", prestamosActivos);
        model.addAttribute("multasPendientes", multasPendientes);
        return "admin/dashboard";
    }

    @GetMapping("/libros")
    public String libros(Model model) {
        model.addAttribute("libros", libroService.listarTodos());
        return "admin/libros";
    }

    @GetMapping("/usuarios")
    public String usuarios(Model model) {
        model.addAttribute("usuarios", usuarioService.listarTodos());
        return "admin/usuarios";
    }

    @GetMapping("/prestamos")
    public String prestamos(Model model) {
        model.addAttribute("prestamos", prestamoService.listarTodos());
        return "admin/prestamos";
    }

    @PostMapping("/prestamos/{id}/estado")
    public String actualizarEstadoPrestamo(@PathVariable Integer id, @RequestParam String nuevoEstado) {
        prestamoService.actualizarEstadoPrestamo(id, nuevoEstado);
        return "redirect:/admin/prestamos";
    }

    @GetMapping("/multas")
    public String multas(Model model) {
        model.addAttribute("multas", multaService.listarTodos());
        return "admin/multas";
    }

    @PostMapping("/multas/{id}/pagar")
    public String pagarMulta(@PathVariable Integer id) {
        multaService.marcarComoPagada(id);
        return "redirect:/admin/multas";
    }
}
