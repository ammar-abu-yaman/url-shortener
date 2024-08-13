package com.ammarymn.urlshortenerservice.repository

import com.ammarymn.urlshortenerservice.model.ShortenedUrl
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable
import software.amazon.awssdk.enhanced.dynamodb.Expression
import software.amazon.awssdk.enhanced.dynamodb.Key

@Repository
class ShortenedUrlDynamoDbRepository @Autowired constructor(val table: DynamoDbTable<ShortenedUrl>): ShortenedUrlRepository {

    override fun putIfNotExist(shortenedUrl: ShortenedUrl): ShortenedUrl {
        table.putItemWithResponse { it
            .item(shortenedUrl)
            .conditionExpression(Expression.builder()
                .expression("attribute_not_exists(id)")
                .build()
            )
            .build()
            .returnValues()
        }
        return shortenedUrl
    }

    override fun getByShortUrl(shortUrl: String): ShortenedUrl? {
        return table.getItem{ it
            .key(Key.builder().partitionValue(shortUrl).build())
            .consistentRead(false)
            .build()
        }
    }
}