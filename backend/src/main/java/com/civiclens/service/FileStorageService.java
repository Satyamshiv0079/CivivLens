package com.civiclens.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L; // 10 MB limit
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
    );

    public FileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory at " + this.uploadPath, e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 1. File size validation
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 10MB");
        }

        // 2. MIME Content-Type validation
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase().trim())) {
            throw new IllegalArgumentException("Invalid file format. Only JPEG, PNG, and WebP images are allowed.");
        }

        // 3. Path traversal detection in original filename
        String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
        String cleanFilename = StringUtils.cleanPath(rawFilename);
        if (cleanFilename.contains("..") || cleanFilename.contains("/") || cleanFilename.contains("\\")) {
            throw new IllegalArgumentException("Cannot store file with path traversal sequence: " + rawFilename);
        }

        // 4. File extension validation
        String extension = "";
        int dotIndex = cleanFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = cleanFilename.substring(dotIndex).toLowerCase();
        } else {
            extension = ".jpg";
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed.");
        }

        // 5. Image signature (magic bytes) validation
        byte[] headerBytes = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(headerBytes);
            if (read < 4 || !isValidImageSignature(headerBytes, read)) {
                throw new IllegalArgumentException("Invalid file content: image signature verification failed.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read image content for validation", e);
        }

        // 6. Safe UUID filename and path traversal prevention
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = this.uploadPath.resolve(uniqueFileName).normalize();

        if (!targetLocation.startsWith(this.uploadPath)) {
            throw new IllegalArgumentException("Cannot store file outside target upload directory: " + uniqueFileName);
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + uniqueFileName, e);
        }

        return "/uploads/" + uniqueFileName;
    }

    /**
     * Inspect file header magic bytes to verify true JPEG, PNG, or WebP signatures.
     */
    private boolean isValidImageSignature(byte[] header, int bytesRead) {
        if (bytesRead < 4) {
            return false;
        }

        // JPEG magic bytes: FF D8 FF
        if (bytesRead >= 3 && (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return true;
        }

        // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        if (bytesRead >= 8 && (header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
                && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A) {
            return true;
        }

        // WebP magic bytes: RIFF .... WEBP
        if (bytesRead >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
            return true;
        }

        return false;
    }
}
