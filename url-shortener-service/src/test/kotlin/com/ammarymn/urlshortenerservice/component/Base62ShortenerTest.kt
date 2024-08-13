package com.ammarymn.urlshortenerservice.component

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import kotlin.test.Test
import kotlin.test.assertEquals

@SpringBootTest
class Base62ShortenerTest @Autowired constructor(val base62Shortener: Base62Shortener) {

    @Test
    fun testGenerateRandomBase62String() {
        val string = base62Shortener.shortenUrl("http://example.com")
        assertEquals(string.length, Base62Shortener.STRING_LENGTH)
        assert(string.chars().allMatch { c -> Base62Shortener.BASE62_ALPHABET.contains(c.toChar()) })
    }

}