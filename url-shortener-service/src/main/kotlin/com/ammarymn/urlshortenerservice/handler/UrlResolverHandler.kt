package com.ammarymn.urlshortenerservice.handler

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse
import com.ammarymn.urlshortenerservice.model.ShortenedUrl
import com.ammarymn.urlshortenerservice.service.ShortenedUrlService
import com.ammarymn.urlshortenerservice.util.ResponseUtil
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import software.amazon.awssdk.http.HttpStatusCode

import java.util.function.Function

@Component
class UrlResolverHandler @Autowired constructor(val service: ShortenedUrlService, val responseUtil: ResponseUtil)
    : Function<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    override fun apply(event: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        val shortUrlId = event.pathParameters["id"]
        if(isBlank(shortUrlId)) {
            return responseUtil.error("URL Id is missing or empty")
        }
        return when(val shortenedUrl = service.getShortenedUrl(shortUrlId as String)) {
            is ShortenedUrl -> responseUtil.success(shortenedUrl)
            else -> responseUtil.error("URL with id $shortUrlId not found", HttpStatusCode.NOT_FOUND)
        }
    }

    private fun isBlank(str: String?): Boolean {
        return str?.isBlank() == true
    }
}