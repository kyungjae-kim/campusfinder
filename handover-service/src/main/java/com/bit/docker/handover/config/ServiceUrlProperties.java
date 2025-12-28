package com.bit.docker.handover.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "services")
@Getter
@Setter
public class ServiceUrlProperties {
    
    private ServiceUrl lostService;
    private ServiceUrl foundService;
    private ServiceUrl notificationService;
    
    @Getter
    @Setter
    public static class ServiceUrl {
        private String url;
    }
}
