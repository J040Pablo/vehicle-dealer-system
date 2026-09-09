package com.dealership.api.config;

import com.dealership.api.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name:vehicle-dealer-images}")
    private String bucketName;

    @Value("${aws.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.s3.public-url-prefix:}")
    private String publicUrlPrefix;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    @Override
    public String uploadVehicleImage(Long vehicleId, MultipartFile file) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException("Tamanho do arquivo excede o limite máximo de 10MB.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getValidatedExtension(originalFilename);

        String key = "vehicles/" + vehicleId + "/" + UUID.randomUUID() + extension;

        // Bucket Privado sem ACL PUBLIC_READ
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType() != null ? file.getContentType() : "image/jpeg")
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        String fileUrl = buildFileUrl(key);
        log.info("Imagem do veículo {} enviada para o S3 com sucesso. Key: {} URL: {}", vehicleId, key, fileUrl);
        return fileUrl;
    }

    @Override
    public PresignedUrlDTO generatePresignedUploadUrl(Long vehicleId, String originalFilename) {
        String extension = getValidatedExtension(originalFilename);
        String key = "vehicles/" + vehicleId + "/" + UUID.randomUUID() + extension;
        String contentType = getContentTypeFromExtension(extension);

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        String uploadUrl = presignedRequest.url().toString();
        String fileUrl = buildFileUrl(key);

        log.info("Gerada Presigned URL de upload para o veículo {}. Key: {} URL Expiration: 15 min", vehicleId, key);
        return new PresignedUrlDTO(uploadUrl, key, fileUrl, 15);
    }

    @Override
    public void deleteVehicleImage(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) return;

        try {
            String key;
            if (imageUrl.contains(".amazonaws.com/")) {
                key = imageUrl.substring(imageUrl.indexOf(".amazonaws.com/") + 15);
            } else if (imageUrl.contains(bucketName + "/")) {
                key = imageUrl.substring(imageUrl.indexOf(bucketName + "/") + bucketName.length() + 1);
            } else {
                key = imageUrl;
            }

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Imagem removida do S3 com sucesso. Key: {}", key);
        } catch (Exception e) {
            log.warn("Erro ao remover imagem do S3: {}", e.getMessage());
        }
    }

    private String getValidatedExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BusinessException("Formato de imagem não suportado: " + ext + ". Use .jpg, .jpeg, .png ou .webp.");
        }
        return ext;
    }

    private String getContentTypeFromExtension(String extension) {
        return switch (extension) {
            case ".png" -> "image/png";
            case ".webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }

    private String buildFileUrl(String key) {
        if (publicUrlPrefix != null && !publicUrlPrefix.trim().isEmpty()) {
            return publicUrlPrefix.endsWith("/") ? publicUrlPrefix + key : publicUrlPrefix + "/" + key;
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion, key);
    }
}
