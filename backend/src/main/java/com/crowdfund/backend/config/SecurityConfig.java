package com.crowdfund.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for APIs
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/users/register",
                    "/api/users/login",
                    "/api/campaigns/**",
                    "/api/donations/**",
    "/api/campaigns/*/donations/**"   // 👈 allow ALL campaign APIs
                ).permitAll()
                .anyRequest().authenticated()
            )
            .httpBasic(); // simple testing with basic auth if needed
        return http.build();
    }
}
