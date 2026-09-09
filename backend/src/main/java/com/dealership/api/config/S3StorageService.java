package com.dealership.api.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name:vehicle-dealer-images}")
    private String bucketName;

    @Value("${aws.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.s3.public-url-prefix:}")
    private String publicUrlPrefix;

    public String uploadVehicleImage(Long vehicleId, MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            extension = ".jpg";
        }

        String key = "vehicles/" + vehicleId + "/" + UUID.randomUUID() + extension;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType() != null ? file.getContentType() : "image/jpeg")
                .acl(ObjectCannedACL.PUBLIC_READ)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        String fileUrl;
        if (publicUrlPrefix != null && !publicUrlPrefix.trim().isEmpty()) {
            fileUrl = publicUrlPrefix.endsWith("/") ? publicUrlPrefix + key : publicUrlPrefix + "/" + key;
        } else {
            fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion, key);
        }

        log.info("Imagem do veículo {} enviada para o S3 com sucesso. Key: {} URL: {}", vehicleId, key, fileUrl);
        return fileUrl;
    }

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
}
