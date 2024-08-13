import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import com.github.jengelman.gradle.plugins.shadow.transformers.PropertiesFileTransformer

plugins {
	id("org.springframework.boot") version "3.3.2"
	id("io.spring.dependency-management") version "1.1.6"
	id("com.github.johnrengelman.shadow") version "7.1.2"
	kotlin("jvm") version "1.9.24"
	kotlin("plugin.spring") version "1.9.24"
	kotlin("plugin.lombok") version "1.8.10"
	id("io.freefair.lombok") version "5.3.0"
}

group = "com.ammarymn"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

extra["springCloudVersion"] = "2023.0.3"

dependencies {
	// Spring
	implementation("org.springframework.boot:spring-boot-starter-cache")
	implementation("org.springframework.boot:spring-boot-starter-data-redis")
	implementation("org.springframework.cloud:spring-cloud-function-dependencies:4.1.3")
	implementation("org.springframework.cloud:spring-cloud-function-adapter-aws:4.1.3")
	implementation("org.springframework.cloud:spring-cloud-starter-function-web:4.1.3")
	developmentOnly("org.springframework.boot:spring-boot-devtools")

	// Aws
	implementation("software.amazon.awssdk:dynamodb-enhanced:2.26.24")
	implementation("com.amazonaws:aws-lambda-java-core:1.2.3")
	implementation("com.amazonaws:aws-lambda-java-events:3.12.0")
//	implementation("com.amazonaws:aws-lambda-java-log4j2:1.6.0")

	// Log4j
//	implementation("org.apache.logging.log4j:log4j-api:2.17.1")
//	implementation("'org.apache.logging.log4j:log4j-core:2.17.1")
//	runtimeOnly("org.apache.logging.log4j:log4j-slf4j18-impl:2.17.1")

	// Jackson
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.17.2")

	// Kotlin
	implementation("org.jetbrains.kotlin:kotlin-reflect")

	// Test
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("com.amazonaws:DynamoDBLocal:2.5.2")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

dependencyManagement {
	imports {
		mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
	}
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict -Xplugin=\$KOTLIN_HOME/lib/lombok-compiler-plugin.jar")
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}

tasks.withType<ShadowJar> {
	dependsOn(tasks.test)
	archiveClassifier.set("aws")
	dependencies {
		exclude(dependency("org.springframework.cloud:spring-cloud-function-web:4.1.3"))
	}
	// Required for Spring
	mergeServiceFiles()
	append("META-INF/spring.handlers")
	append("META-INF/spring.schemas")
	append("META-INF/spring.tooling")
	append("META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports")
	append("META-INF/spring/org.springframework.boot.actuate.autoconfigure.web.ManagementContextConfiguration.imports")
	transform(PropertiesFileTransformer::class.java) {
		paths = listOf("META-INF/spring.factories")
		mergeStrategy = "append"
	}
}