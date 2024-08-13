package com.ammarymn.urlshortenerservice.testextension

import com.amazonaws.services.dynamodbv2.local.main.ServerRunner
import com.amazonaws.services.dynamodbv2.local.server.DynamoDBProxyServer
import org.junit.jupiter.api.extension.BeforeAllCallback
import org.junit.jupiter.api.extension.ExtensionContext
import java.util.concurrent.atomic.AtomicBoolean

class LocalDynamoDbServerExtension: BeforeAllCallback {
    companion object {
        val PORT = "8000"
        private val initializationFlag = AtomicBoolean(false)
        lateinit var dynamoDbServer: DynamoDBProxyServer;
    }

    override fun beforeAll(p0: ExtensionContext?) {
        if(!initializationFlag.getAndSet(true)) {
            dynamoDbServer = ServerRunner.createServerFromCommandLineArgs(arrayOf("-inMemory", "-port", PORT))
            dynamoDbServer.start()
            Runtime.getRuntime().addShutdownHook(Thread { dynamoDbServer.stop() })
        }
    }
}