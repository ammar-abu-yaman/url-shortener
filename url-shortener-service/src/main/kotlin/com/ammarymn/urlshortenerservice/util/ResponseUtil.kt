package com.ammarymn.urlshortenerservice.util

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import software.amazon.awssdk.http.HttpStatusCode

@Component
class ResponseUtil @Autowired constructor(private val objectMapper: ObjectMapper) {

    companion object {
        private val JSON_CONTENT_TYPE = mapOf(HttpHeaders.CONTENT_TYPE to "application/json")
    }

    fun <T> success(data: T, code: Int = HttpStatusCode.OK) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(code)
        .withHeaders(JSON_CONTENT_TYPE)
        .withBody(toJson(data))
        .build()

    fun redirect(url: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(HttpStatusCode.MOVED_PERMANENTLY)
        .withHeaders(mapOf(HttpHeaders.LOCATION to url))
        .build()

    fun error(error: String, code: Int = HttpStatusCode.BAD_REQUEST) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(code)
        .withHeaders(JSON_CONTENT_TYPE)
        .withBody(toJson(ErrorResponse(error)))
        .build()

    private fun <T> toJson(data: T) = objectMapper.writeValueAsString(data)

}

data class ErrorResponse(val error: String)