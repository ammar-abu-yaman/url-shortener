package com.ammarymn.urlshortenerservice.model


import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey
import java.time.LocalDateTime

@DynamoDbBean
data class ShortenedUrl(
    @get:DynamoDbPartitionKey var id: String = "",
    var originalUrl: String = "",
    var timestamp: LocalDateTime = LocalDateTime.now(),
    var expiration: LocalDateTime = timestamp.plusHours(1)
)