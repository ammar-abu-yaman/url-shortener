package com.ammarymn.urlshortenerservice.service

import com.ammarymn.urlshortenerservice.model.ShortenedUrl
import com.ammarymn.urlshortenerservice.repository.ShortenedUrlRepository
import com.ammarymn.urlshortenerservice.component.Base62Shortener
import com.ammarymn.urlshortenerservice.component.UrlShortener
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.CachePut
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException
import java.time.LocalDateTime

@Service
class ShortenedUrlService @Autowired constructor(val repository: ShortenedUrlRepository, val shortener: UrlShortener) {

    companion object {
        private const val RETRY_COUNT = 3
    }

    fun getShortenedUrl(id: String): ShortenedUrl? = repository.getByShortUrl(id)
    
    fun shortenUrl(url: String): ShortenedUrl {
        repeat(RETRY_COUNT) {
            val id = shortener.shortenUrl(url)
            val timestamp = LocalDateTime.now()
            val shortenedUrl = ShortenedUrl(
                id,
                originalUrl = url,
                timestamp,
                expiration = timestamp.plusHours(1)
            )
            try {
                repository.putIfNotExist(shortenedUrl)
                return shortenedUrl
            } catch (exc: ConditionalCheckFailedException) {
                TODO("Add error logging")
            }
        }
        throw RuntimeException("Couldn't find shortened url: $url")
    }

}