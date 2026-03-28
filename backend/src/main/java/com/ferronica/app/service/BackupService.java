package com.ferronica.app.service;

import java.io.File;
import java.io.IOException;

/**
 * Service for Database backup and restore.
 */
public interface BackupService {
    /**
     * Create a database backup.
     * @return File containing the backup
     * @throws IOException if backup fails
     * @throws InterruptedException if backup process is interrupted
     */
    File createBackup() throws IOException, InterruptedException;

    /**
     * Restore a database from a backup file.
     * @param backupFile the file to restore from
     * @throws IOException if restore fails
     * @throws InterruptedException if restore process is interrupted
     */
    void restoreBackup(File backupFile) throws IOException, InterruptedException;
}
