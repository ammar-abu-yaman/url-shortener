package com.ammarymn.urlshortenerservice.component

interface UrlShortener {
    fun shortenUrl(url: String): String
}