package com.dealership.api.config;

import com.dealership.api.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.net.URL;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3StorageServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private PresignedPutObjectRequest presignedPutObjectRequest;

    private S3StorageService s3StorageService;

    @BeforeEach
    void setUp() {
        s3StorageService = new S3StorageService(s3Client, s3Presigner);
        ReflectionTestUtils.setField(s3StorageService, "bucketName", "test-bucket");
        ReflectionTestUtils.setField(s3StorageService, "awsRegion", "us-east-1");
    }

    @Test
    @DisplayName("Deve fazer upload de imagem do veículo com sucesso sem ACL pública")
    void uploadVehicleImage_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "car.jpg", "image/jpeg", "fake-image-bytes".getBytes()
        );

        String fileUrl = s3StorageService.uploadVehicleImage(10L, file);

        assertNotNull(fileUrl);
        assertTrue(fileUrl.contains("test-bucket.s3.us-east-1.amazonaws.com/vehicles/10/"));
        assertTrue(fileUrl.endsWith(".jpg"));
        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando o formato de arquivo não for suportado")
    void uploadVehicleImage_InvalidExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "malicious.exe", "application/octet-stream", "bad-content".getBytes()
        );

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> s3StorageService.uploadVehicleImage(10L, file)
        );

        assertTrue(exception.getMessage().contains("Formato de imagem não suportado"));
        verifyNoInteractions(s3Client);
    }

    @Test
    @DisplayName("Deve gerar Presigned URL de upload válida por 15 minutos")
    void generatePresignedUploadUrl_Success() throws Exception {
        URL mockUrl = new URL("https://test-bucket.s3.us-east-1.amazonaws.com/vehicles/10/uuid.jpg?signature=123");
        when(presignedPutObjectRequest.url()).thenReturn(mockUrl);
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedPutObjectRequest);

        PresignedUrlDTO result = s3StorageService.generatePresignedUploadUrl(10L, "photo.png");

        assertNotNull(result);
        assertEquals(mockUrl.toString(), result.uploadUrl());
        assertEquals(15, result.expirationMinutes());
        assertTrue(result.fileKey().startsWith("vehicles/10/"));
        assertTrue(result.fileKey().endsWith(".png"));
    }

    @Test
    @DisplayName("Deve deletar objeto do S3 com sucesso")
    void deleteVehicleImage_Success() {
        String imageUrl = "https://test-bucket.s3.us-east-1.amazonaws.com/vehicles/10/abc-123.jpg";

        s3StorageService.deleteVehicleImage(imageUrl);

        verify(s3Client, times(1)).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    @DisplayName("Não deve estourar erro se ocorrer exceção ao deletar objeto do S3 (modo gracioso)")
    void deleteVehicleImage_GracefulOnException() {
        doThrow(new RuntimeException("AWS Service Down")).when(s3Client).deleteObject(any(DeleteObjectRequest.class));

        assertDoesNotThrow(() -> s3StorageService.deleteVehicleImage("https://test-bucket.s3.us-east-1.amazonaws.com/vehicles/10/abc.jpg"));
    }
}
