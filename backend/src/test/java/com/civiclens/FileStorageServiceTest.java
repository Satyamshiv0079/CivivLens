package com.civiclens;

import com.civiclens.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    private FileStorageService fileStorageService;

    @TempDir
    Path tempUploadDir;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempUploadDir.toString());
    }

    @Test
    void storeFile_ValidJpegImage_Success() {
        // Genuine JPEG header: FF D8 FF E0
        byte[] validJpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01};
        MockMultipartFile file = new MockMultipartFile(
                "photo",
                "valid-photo.jpg",
                "image/jpeg",
                validJpegBytes
        );

        String resultPath = fileStorageService.storeFile(file);
        assertNotNull(resultPath);
        assertTrue(resultPath.startsWith("/uploads/"));
        assertTrue(resultPath.endsWith(".jpg"));
    }

    @Test
    void storeFile_ValidPngImage_Success() {
        // Genuine PNG header: 89 50 4E 47 0D 0A 1A 0A
        byte[] validPngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D};
        MockMultipartFile file = new MockMultipartFile(
                "photo",
                "report.png",
                "image/png",
                validPngBytes
        );

        String resultPath = fileStorageService.storeFile(file);
        assertNotNull(resultPath);
        assertTrue(resultPath.startsWith("/uploads/"));
        assertTrue(resultPath.endsWith(".png"));
    }

    @Test
    void storeFile_InvalidMimeType_ThrowsIllegalArgumentException() {
        byte[] bytes = "echo 'malicious script'".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "photo",
                "script.sh",
                "application/x-sh",
                bytes
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(file)
        );
        assertTrue(ex.getMessage().contains("Invalid file format"));
    }

    @Test
    void storeFile_PathTraversalAttempt_ThrowsIllegalArgumentException() {
        byte[] validJpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01};
        MockMultipartFile file = new MockMultipartFile(
                "photo",
                "../../malicious.jpg",
                "image/jpeg",
                validJpegBytes
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(file)
        );
        assertTrue(ex.getMessage().contains("path traversal"));
    }

    @Test
    void storeFile_FakeImageSignature_ThrowsIllegalArgumentException() {
        // Text content disguised as image/jpeg
        byte[] fakeBytes = "This is not really an image file".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "photo",
                "fake-photo.jpg",
                "image/jpeg",
                fakeBytes
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(file)
        );
        assertTrue(ex.getMessage().contains("image signature verification failed"));
    }

    @Test
    void storeFile_OversizedFile_ThrowsIllegalArgumentException() {
        // 11 MB simulated
        MockMultipartFile oversizedFile = new MockMultipartFile(
                "photo",
                "huge.jpg",
                "image/jpeg",
                new byte[10] // dummy content, but mock getSize()
        ) {
            @Override
            public long getSize() {
                return 11 * 1024 * 1024L; // 11 MB
            }
        };

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeFile(oversizedFile)
        );
        assertTrue(ex.getMessage().contains("exceeds maximum allowed limit"));
    }
}
