package com.ammarymn.urlshortenerservice.repository

import com.ammarymn.urlshortenerservice.model.ShortenedUrl


interface ShortenedUrlRepository {
    fun putIfNotExist(shortenedUrl: ShortenedUrl): ShortenedUrl
    fun getByShortUrl(shortUrl: String): ShortenedUrl?
}