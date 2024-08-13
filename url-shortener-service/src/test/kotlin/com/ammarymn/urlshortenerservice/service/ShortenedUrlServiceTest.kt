package com.ammarymn.urlshortenerservice.service

import com.ammarymn.urlshortenerservice.model.ShortenedUrl
import com.ammarymn.urlshortenerservice.repository.ShortenedUrlDynamoDbRepository
import com.ammarymn.urlshortenerservice.repository.ShortenedUrlRepository
import com.ammarymn.urlshortenerservice.testextension.LocalDynamoDbServerExtension
import com.ammarymn.urlshortenerservice.testextension.LocalDynamoDbServerExtension.Companion.PORT
import com.ammarymn.urlshortenerservice.component.Base62Shortener
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.assertDoesNotThrow

import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.cache.CacheManager
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable
import software.amazon.awssdk.enhanced.dynamodb.TableSchema
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import java.net.URL
import java.time.temporal.ChronoUnit
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals

@SpringBootTest
@ExtendWith(LocalDynamoDbServerExtension::class)
class ShortenedUrlServiceTest {

    init {
        System.setProperty("aws.region", "us-east-1");
        System.setProperty("aws.accessKeyId", "test");
        System.setProperty("aws.secretAccessKey", "test");
    }

    companion object {

        private const val TEST_URL = "https://example.com"

        private lateinit var dynamoDbClient: DynamoDbClient
        private lateinit var enhancedClient: DynamoDbEnhancedClient
        private lateinit var shortenedUrlTable: DynamoDbTable<ShortenedUrl>
        private lateinit var dynamoDbRepository: ShortenedUrlDynamoDbRepository
        private lateinit var shortenedUrlRepository: ShortenedUrlRepository
        private lateinit var shortenedUrlService: ShortenedUrlService

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
            shortenedUrlRepository = ShortenedUrlDynamoDbRepository(shortenedUrlTable)
            shortenedUrlService = ShortenedUrlService(shortenedUrlRepository, Base62Shortener())
        }

        @AfterAll
        @JvmStatic
        fun tearDown() {
            shortenedUrlTable.deleteTable()
        }
    }

    @Test
    fun givenNoConflictThenShortUrlShouldBeStored() {
        val url = "https://example.com${UUID.randomUUID()}"
        val shortenedUrl = assertDoesNotThrow { shortenedUrlService.shortenUrl(url) }
        assertEquals(shortenedUrl.id.length, Base62Shortener.STRING_LENGTH)
        assertEquals(shortenedUrl.originalUrl, url)
        assertEquals(ChronoUnit.HOURS.between(shortenedUrl.timestamp, shortenedUrl.expiration), 1)
    }


}