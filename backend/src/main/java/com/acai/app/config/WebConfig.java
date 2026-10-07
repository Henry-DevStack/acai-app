package com.acai.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final OwnerAuthInterceptor ownerAuth;
    private final String[] frontendUrls;

    public WebConfig(OwnerAuthInterceptor ownerAuth, @Value("${acai.frontend-url}") String frontendUrls) {
        this.ownerAuth = ownerAuth;
        this.frontendUrls = frontendUrls.split("\\s*,\\s*");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(ownerAuth).addPathPatterns("/api/owner/**").excludePathPatterns("/api/owner/login");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(frontendUrls)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    }
}
