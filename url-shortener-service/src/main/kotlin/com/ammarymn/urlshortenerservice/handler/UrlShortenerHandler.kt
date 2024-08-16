package com.ammarymn.urlshortenerservice.handler

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse
import com.ammarymn.urlshortenerservice.service.ShortenedUrlService
import com.ammarymn.urlshortenerservice.util.ResponseUtil
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.JsonMappingException
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import software.amazon.awssdk.http.HttpStatusCode
import java.net.MalformedURLException
import java.net.URL

import java.util.function.Function

@Component
class UrlShortenerHandler @Autowired constructor(val service: ShortenedUrlService,
                                                 val objectMapper: ObjectMapper,
                                                 val responseUtil: ResponseUtil)
    : Function<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    override fun apply(event: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        try {
            val url = objectMapper.readTree(event.body)?.get("url")?.asText()
            validateUrl(url)
            val shortenedUrl = service.shortenUrl(url!!)
            return responseUtil.success(shortenedUrl)
        } catch (exc: Exception) {
            return when (exc) {
                is NullPointerException -> responseUtil.error("URL is missing or empty")
                is MalformedURLException -> responseUtil.error("URL is malformed: ${exc.message}")
                is JsonProcessingException, is JsonMappingException -> responseUtil.error("Malformed Json input: ${exc.message}")
                else -> responseUtil.error("Internal error: ${exc.message}", HttpStatusCode.INTERNAL_SERVER_ERROR)
            }
        }
    }

    private fun validateUrl(url: String?) = URL(url)
}