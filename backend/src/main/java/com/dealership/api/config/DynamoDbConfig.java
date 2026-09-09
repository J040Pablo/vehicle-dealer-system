package com.dealership.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClientBuilder;

import java.net.URI;

@Slf4j
@Configuration
public class DynamoDbConfig {

    @Value("${aws.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.dynamodb.endpoint:}")
    private String dynamodbEndpoint;

    @Bean
    @ConditionalOnProperty(name = "aws.dynamodb.enabled", havingValue = "true", matchIfMissing = true)
    public DynamoDbClient dynamoDbClient() {
        log.info("Inicializando AWS DynamoDbClient para a região: {}", awsRegion);
        DynamoDbClientBuilder builder = DynamoDbClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create());

        if (dynamodbEndpoint != null && !dynamodbEndpoint.trim().isEmpty()) {
            log.info("Configurando endpoint customizado para DynamoDB: {}", dynamodbEndpoint);
            builder.endpointOverride(URI.create(dynamodbEndpoint));
        }

        return builder.build();
    }

    @Bean
    @ConditionalOnProperty(name = "aws.dynamodb.enabled", havingValue = "true", matchIfMissing = true)
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
    }
}
