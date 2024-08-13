package com.ammarymn.urlshortenerservice.testconfig

import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisStandaloneConfiguration
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.Duration

@Configuration
@ExtendWith(SpringExtension::class)
@EnableCaching
class RedisTestConfig {

    @Bean
    fun cacheManager() : CacheManager = RedisCacheManager
        .builder(LettuceConnectionFactory(RedisStandaloneConfiguration("localhost", 6379)))
        .cacheDefaults(
            RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .serializeValuesWith(SerializationPair.fromSerializer(GenericJackson2JsonRedisSerializer()))
        ).build()

}