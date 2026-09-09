package com.dealership.api.shared.audit;

import lombok.*;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@DynamoDbBean
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynamoAuditLog {

    private String partitionKey;
    private String sortKey;
    private String entityType;
    private Long entityId;
    private String action;
    private String payload;
    private String actor;
    private String correlationId;
    private Long ttl;

    @DynamoDbPartitionKey
    public String getPartitionKey() {
        return partitionKey;
    }

    @DynamoDbSortKey
    public String getSortKey() {
        return sortKey;
    }
}
