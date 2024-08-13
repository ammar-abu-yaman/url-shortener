package com.ammarymn.urlshortenerservice.config

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient

@Configuration
class AwsConfig {

    @Value("\${aws.region:me-south-1}")
    private val regionString: String = ""

    @Bean
    fun awsRegion(): Region {
        return Region.of(regionString)
    }

    @Bean
    @Autowired
    fun dynamoDbClient(region: Region): DynamoDbClient {
        return DynamoDbClient.builder()
            .region(region)
            .build()
    }

    @Bean
    @Autowired
    fun dynamoDbEnhancedClient(client: DynamoDbClient): DynamoDbEnhancedClient {
        return DynamoDbEnhancedClient.builder()
            .dynamoDbClient(client)
            .build()
    }

}