package com.crowdfund.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/users/register",
                    "/api/users/login",
                    "/api/campaigns/**",
                    "/api/images/upload",
                    "/api/receipt/**"
                ).permitAll()
                .requestMatchers(HttpMethod.POST, "/api/payments/**").permitAll() // allow POST explicitly
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // allow preflight requests
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
