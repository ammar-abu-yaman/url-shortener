package com.ammarymn.urlshortenerservice.config

import com.ammarymn.urlshortenerservice.model.ShortenedUrl
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable
import software.amazon.awssdk.enhanced.dynamodb.TableSchema

@Configuration
class DynamoDbConfig {

    @Bean
    fun shortenedUrlTable(client: DynamoDbEnhancedClient): DynamoDbTable<ShortenedUrl> {
        return client.table("ShortenedUrl", TableSchema.fromBean(ShortenedUrl::class.java))
    }
}