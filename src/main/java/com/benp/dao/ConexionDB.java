/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.dao;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import java.util.logging.FileHandler;
import java.util.logging.SimpleFormatter;
import java.util.logging.Level;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ConexionDB {
    
    // Ajusta el puerto (3306), usuario y contraseña según tu configuración de MySQL local
    private static final String URL = "jdbc:mysql://localhost:3306/bliblioteca?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root"; 
    private static final String PASSWORD = ""; 

    // =========================================================================
    // 📊 MONITOREO Y AUDITORÍA NATIVA (REEMPLAZA AL @Slf4j SIN ERRORES DE PLUGIN)
    // =========================================================================
    public static final java.util.logging.Logger log = java.util.logging.Logger.getLogger("com.benp");

    // =========================================================================
    // 🗄️ RESPALDADOR AUTOMÁTICO EN SEGUNDO PLANO (HILO DE EJECUCIÓN CONTINUO)
    // =========================================================================
    private static final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // BLOQUE ESTÁTICO DE INICIALIZACIÓN AUTOMÁTICA AL LEVANTAR EL SISTEMA
    static {
        try {
            // 📁 A. CANAL DE LOGS: Creamos la carpeta física si no existe
            File carpetaLogs = new File("C:/biblioteca_logs");
            if (!carpetaLogs.exists()) {
                carpetaLogs.mkdirs();
            }

            // 📝 ARCHIVO 1: info.txt (Registra operaciones comunes y felices)
            FileHandler info = new FileHandler("C:/biblioteca_logs/info.txt", 20480, 1, true);
            info.setFormatter(new SimpleFormatter());
            info.setFilter(record -> record.getLevel() == Level.INFO);
            log.addHandler(info);

            // 📝 ARCHIVO 2: warning.txt (Registra alertas de borrado lógico y bloqueos)
            FileHandler warn = new FileHandler("C:/biblioteca_logs/warning.txt", 20480, 1, true);
            warn.setFormatter(new SimpleFormatter());
            warn.setFilter(record -> record.getLevel() == Level.WARNING);
            log.addHandler(warn);

            // 📝 ARCHIVO 3: error.txt (Registra excepciones críticas de persistencia)
            FileHandler err = new FileHandler("C:/biblioteca_logs/error.txt", 20480, 1, true);
            err.setFormatter(new SimpleFormatter());
            err.setLevel(Level.SEVERE);
            log.addHandler(err);

            log.info("=== MOTOR DE AUDITORÍA MAVEN INICIALIZADO AUTOMÁTICAMENTE ===");

        } catch (IOException e) {
            System.err.println("Error crítico al inicializar la pasarela de logs: " + e.getMessage());
        }

        // 🚀 B. CANAL DE BACKUPS: Hilo secundario asíncrono continuo
        // Se ejecuta por primera vez a los 10 segundos de encender el sistema,
        // y luego se repite automáticamente cada 24 horas de forma invisible.
        
        scheduler.scheduleAtFixedRate(() -> {
            try {
                log.info("Iniciando proceso programado de copia de seguridad de la base de datos...");
                
                File carpetaBackups = new File("C:/biblioteca_backups");
                if (!carpetaBackups.exists()) {
                    carpetaBackups.mkdirs();
                }

                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                String rutaArchivoFinal = "C:/biblioteca_backups/backup_benp_" + timestamp + ".sql";

                // Sentencia de consola nativa de Windows que invoca a mysqldump
                // Usa exactamente el nombre de tu base de datos de la URL: bliblioteca
                String comando = "C:/xampp/mysql/bin/mysqldump -u " + USER + " bliblioteca -r " + rutaArchivoFinal;

                // Invocamos el proceso del sistema operativo de forma asíncrona
                Process proceso = Runtime.getRuntime().exec(comando);
                int codigoSalida = proceso.waitFor();

                if (codigoSalida == 0) {
                    log.info("Copia de seguridad consolidada con éxito en: " + rutaArchivoFinal);
                } else {
                    log.warning("El proceso mysqldump finalizó con código de advertencia: " + codigoSalida);
                }

            } catch (Exception e) {
                log.severe("Fallo crítico en el hilo secundario de copias de seguridad: " + e.getMessage());
            }
        }, 10, 5, TimeUnit.MINUTES); 
        // .sql cada minuto frente a sus ojos, cambia el '24' por '1' y 'TimeUnit.HOURS' por 'TimeUnit.MINUTES'.
    }

    public static Connection getConnection() throws SQLException {
        try {
            // Cargar el driver de MySQL
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            log.severe("Error al cargar el Driver de MySQL: " + e.getMessage());
        }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}