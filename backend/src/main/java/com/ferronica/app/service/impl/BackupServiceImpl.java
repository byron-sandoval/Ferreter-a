package com.ferronica.app.service.impl;

import com.ferronica.app.service.BackupService;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * Implementation for Database backup and restore using pg_dump and pg_restore.
 */
@Service
public class BackupServiceImpl implements BackupService {

    private final Logger log = LoggerFactory.getLogger(BackupServiceImpl.class);

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    public BackupServiceImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public File createBackup() throws IOException, InterruptedException {
        log.debug("Iniciando creación de respaldo...");
        String dbName = extractDatabaseName();
        String host = extractHostName();
        String port = extractPortNumber();

        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File backupFile = File.createTempFile("backup_" + timestamp + "_", ".dump");

        ProcessBuilder pb = new ProcessBuilder(
            "pg_dump", "-h", host, "-p", port, "-U", dbUser,
            "-F", "c", "-b", "-v", "--no-owner", "-f", backupFile.getAbsolutePath(), dbName
        );

        prepareProcessEnvironment(pb);
        runDatabaseCommand(pb, "pg_dump", false);
        
        log.info("Respaldo creado exitosamente: {}", backupFile.getAbsolutePath());
        return backupFile;
    }

    @Override
    public void restoreBackup(File backupFile) throws IOException, InterruptedException {
        log.debug("Iniciando restauración desde: {}", backupFile.getAbsolutePath());
        String dbName = extractDatabaseName();
        String host = extractHostName();
        String port = extractPortNumber();

        // Limpiar conexiones activas
        try {
            log.debug("Limpiando conexiones activas a la base de datos: {}", dbName);
            jdbcTemplate.execute("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '" + dbName + "' AND pid <> pg_backend_pid()");
            Thread.sleep(1000);
        } catch (Exception e) {
            log.warn("No se pudieron cerrar todas las conexiones previas: {}", e.getMessage());
        }

        // Usamos pg_restore con flags para ignorar dueños y privilegios
        ProcessBuilder pb = new ProcessBuilder(
            "pg_restore", "-h", host, "-p", port, "-U", dbUser,
            "-d", dbName, "-c", "--if-exists", "--no-owner", "--no-privileges", "-v",
            backupFile.getAbsolutePath()
        );

        prepareProcessEnvironment(pb);
        
        // El tercer parámetro 'true' indica que sea flexible con los códigos de salida de pg_restore
        runDatabaseCommand(pb, "pg_restore", true);
        
        log.info("Restauración completada.");
    }

    private void prepareProcessEnvironment(ProcessBuilder pb) {
        if (dbPassword != null && !dbPassword.isEmpty()) {
            pb.environment().put("PGPASSWORD", dbPassword);
        }
    }

    private void runDatabaseCommand(ProcessBuilder pb, String commandLabel, boolean lenient) throws IOException, InterruptedException {
        pb.redirectErrorStream(true);
        Process process = pb.start();
        StringBuilder outputLog = new StringBuilder();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                outputLog.append(line).append("\n");
                log.debug("{}: {}", commandLabel, line);
            }
        }
        
        int exitCode = process.waitFor();
        
        // pg_restore suele salir con código 1 si hubo advertencias que se pueden ignorar
        if (exitCode != 0) {
            if (lenient && exitCode == 1) {
                log.warn("{} terminó con advertencias (código 1), pero se considera exitosa.", commandLabel);
                return;
            }
            throw new IOException(commandLabel + " falló (error " + exitCode + "): " + outputLog.toString());
        }
    }

    private String extractDatabaseName() {
        if (dbUrl == null) return "";
        int lastSlash = dbUrl.lastIndexOf("/");
        int queryIndex = dbUrl.indexOf("?", lastSlash);
        if (queryIndex != -1) {
            return dbUrl.substring(lastSlash + 1, queryIndex);
        }
        return dbUrl.substring(lastSlash + 1);
    }

    private String extractHostName() {
        try {
            String cleanUrl = dbUrl.substring(dbUrl.indexOf("//") + 2);
            String hostAndPort = cleanUrl.split("/")[0];
            return hostAndPort.split(":")[0];
        } catch (Exception e) {
            return "localhost";
        }
    }

    private String extractPortNumber() {
        try {
            String cleanUrl = dbUrl.substring(dbUrl.indexOf("//") + 2);
            String hostAndPort = cleanUrl.split("/")[0];
            String[] parts = hostAndPort.split(":");
            return parts.length > 1 ? parts[parts.length - 1] : "5432";
        } catch (Exception e) {
            return "5432";
        }
    }
}
