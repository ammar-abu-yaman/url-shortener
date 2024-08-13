package com.ammarymn.urlshortenerservice.repository

import com.ammarymn.urlshortenerservice.model.ShortenedUrl
import com.ammarymn.urlshortenerservice.testextension.LocalDynamoDbServerExtension
import com.ammarymn.urlshortenerservice.testextension.LocalDynamoDbServerExtension.Companion.PORT
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable
import software.amazon.awssdk.enhanced.dynamodb.TableSchema
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException
import java.net.URL
import java.time.LocalDateTime
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull


@SpringBootTest
@ExtendWith(LocalDynamoDbServerExtension::class)
class ShortenedUrlDynamoDbRepositoryTest {

    init {
        System.setProperty("aws.region", "us-east-1");
        System.setProperty("aws.accessKeyId", "test");
        System.setProperty("aws.secretAccessKey", "test");
    }

    companion object {

        private lateinit var dynamoDbClient: DynamoDbClient
        private lateinit var enhancedClient: DynamoDbEnhancedClient
        private lateinit var shortenedUrlTable: DynamoDbTable<ShortenedUrl>
        private lateinit var dynamoDbRepository: ShortenedUrlDynamoDbRepository;

        @JvmStatic
        @BeforeAll
        fun setup() {
            dynamoDbClient = DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider {
                    AwsBasicCredentials.builder()
                        .providerName("test-provider")
                        .accessKeyId("test")
                        .secretAccessKey("test")
                        .build()
                }
                .endpointOverride(URL("http://localhost:$PORT").toURI())
                .build()
            enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build()
            shortenedUrlTable = enhancedClient.table("ShortenedUrl", TableSchema.fromBean(ShortenedUrl::class.java))
            shortenedUrlTable.createTable()
            dynamoDbRepository = ShortenedUrlDynamoDbRepository(shortenedUrlTable)
        }

        @AfterAll
        @JvmStatic
        fun tearDown() {
            shortenedUrlTable.deleteTable()
        }
    }


    @Test
    fun givenNoCollisionsShouldCreateShortenedUrl() {
        val id = UUID.randomUUID().toString()
        val shortenedUrl = ShortenedUrl(id, "http://example.com", LocalDateTime.now())
        val createdShortenedUrl = assertDoesNotThrow { dynamoDbRepository.putIfNotExist(shortenedUrl) }
        assertEquals(shortenedUrl, createdShortenedUrl)
    }

    @Test
    fun givenCollisionShouldNotCreateNewShortenedUrl() {
        val id = UUID.randomUUID().toString()
        val shortenedUrl = ShortenedUrl(id, "http://example.com", LocalDateTime.now())
        val duplicateShortenedUrl = ShortenedUrl(id, "http://example.com2", LocalDateTime.now())
        assertDoesNotThrow { dynamoDbRepository.putIfNotExist(shortenedUrl) }
        assertThrows<ConditionalCheckFailedException> { dynamoDbRepository.putIfNotExist(duplicateShortenedUrl)  }
    }

    @Test
    fun givenShortenedUrlShouldGetShortenedUrl() {
        val id = UUID.randomUUID().toString()
        val shortenedUrl = ShortenedUrl(id, "http://example.com", LocalDateTime.now())
        dynamoDbRepository.putIfNotExist(shortenedUrl)
        val returnedShortenedUrl = dynamoDbRepository.getByShortUrl(id)
        assertEquals(shortenedUrl, returnedShortenedUrl)
    }

    @Test
    fun givenNoShortenedUrlNullShouldBeReturned() {
        val shortenedUrl = dynamoDbRepository.getByShortUrl("1")
        assertNull(shortenedUrl)
    }
}