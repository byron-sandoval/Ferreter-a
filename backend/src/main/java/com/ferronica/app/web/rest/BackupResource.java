package com.ferronica.app.web.rest;

import com.ferronica.app.service.BackupService;
import com.ferronica.app.web.rest.errors.BadRequestAlertException;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for managing Database Backups.
 */
@RestController
@RequestMapping("/api/backup")
public class BackupResource {

    private static final Logger LOG = LoggerFactory.getLogger(BackupResource.class);

    private final BackupService backupService;

    public BackupResource(BackupService backupService) {
        this.backupService = backupService;
    }

    /**
     * {@code GET  /api/backup} : download a new database backup.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the backup file.
     */
    @GetMapping("")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Resource> downloadBackup() {
        LOG.debug("REST request to download Database Backup");
        try {
            File backupFile = backupService.createBackup();
            InputStreamResource resource = new InputStreamResource(new FileInputStream(backupFile));

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + backupFile.getName())
                .contentLength(backupFile.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
        } catch (IOException | InterruptedException e) {
            LOG.error("Error creating backup: ", e);
            throw new BadRequestAlertException("Falló la creación: " + e.getMessage(), "backup", "backupfailed");
        }
    }

    /**
     * {@code POST  /api/backup/restore} : restore the database from a backup file.
     * @param file the backup file to restore.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PostMapping("/restore")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> restoreBackup(@RequestParam("file") MultipartFile file) {
        LOG.debug("REST request to restore Database Backup");
        if (file.isEmpty()) {
            throw new BadRequestAlertException("Archivo vacío", "backup", "emptyfile");
        }

        try {
            Path tempFile = Files.createTempFile("restore_", "_" + file.getOriginalFilename());
            file.transferTo(tempFile.toFile());

            backupService.restoreBackup(tempFile.toFile());

            Files.delete(tempFile);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            LOG.error("Error detallado al restaurar respaldo: ", e);
            // IMPORTANTE: Devolvemos el mensaje completo del error detallado
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Error desconocido en pg_restore";
            
            // Limitamos longitud para evitar que desborde el UI si es extremadamente largo
            if (errorMsg.length() > 500) {
                errorMsg = errorMsg.substring(0, 500) + "...";
            }
            
            throw new BadRequestAlertException(errorMsg, "backup", "restorefailed");
        }
    }
}
