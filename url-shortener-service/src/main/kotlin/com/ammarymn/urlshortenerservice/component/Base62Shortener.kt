package com.ammarymn.urlshortenerservice.component

import org.springframework.stereotype.Component
import java.util.Random


@Component
class Base62Shortener: UrlShortener {
    companion object {
        internal const val BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        internal const val BASE = 62L
        internal const val UPPER_BOUND = 218340105584896L // 62 ^ 8
        internal const val STRING_LENGTH = 8
    }

    override fun shortenUrl(url: String) = generateRandomBase62String()

    fun generateRandomBase62String(): String {
        val randomInt = generateRandomNumber()
        val base62Encoded = encodeIntToBase62(randomInt)
        return fixToLength(base62Encoded)
    }

    private fun generateRandomNumber() = Random().nextLong(UPPER_BOUND)

    private fun encodeIntToBase62(number: Long): String {
        var number = number
        val sb = StringBuilder()
        while (number != 0L) {
            val reminder = (number % BASE).toInt()
            sb.append(BASE62_ALPHABET[reminder])
            number /= BASE
        }
        while (sb.length < STRING_LENGTH)
            sb.insert(0, '0')
        return sb.reverse().toString()
    }

    private fun fixToLength(base62Encoded: String): String {
        return when {
            base62Encoded.length == STRING_LENGTH -> base62Encoded
            base62Encoded.length > STRING_LENGTH -> base62Encoded.substring(0, STRING_LENGTH)
            else -> {
                var paddedNumber = base62Encoded
                while (paddedNumber.length < STRING_LENGTH) {
                    paddedNumber += BASE62_ALPHABET[Random().nextInt(62)].toString()
                }
                paddedNumber
            }
        }
    }

}