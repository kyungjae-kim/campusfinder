package com.bit.docker.message.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {
    
    @Bean
    public WebClient.Builder webClientBuilder() {
        HttpClient httpClient = HttpClient.create()
            .responseTimeout(Duration.ofSeconds(5));
        
        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
    }
    
    @Bean
    public WebClient handoverServiceWebClient(WebClient.Builder builder) {
        return builder
            .baseUrl("http://handover-service:8086/api/handovers")
            .build();
    }
    
    @Bean
    public WebClient userServiceWebClient(WebClient.Builder builder) {
        return builder
            .baseUrl("http://user-service:8082/api/users")
            .build();
    }
    
    @Bean
    public WebClient notificationServiceWebClient(WebClient.Builder builder) {
        return builder
            .baseUrl("http://notification-service:8088/api/notifications")
            .build();
    }
}
