package com.dealership.api.config;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {
    String uploadVehicleImage(Long vehicleId, MultipartFile file) throws IOException;
    void deleteVehicleImage(String imageUrl);
    PresignedUrlDTO generatePresignedUploadUrl(Long vehicleId, String originalFilename);
}
