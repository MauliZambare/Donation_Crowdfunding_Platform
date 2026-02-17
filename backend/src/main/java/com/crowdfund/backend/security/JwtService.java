package com.crowdfund.backend.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import com.crowdfund.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts.SIG;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final Pattern BASE64_PATTERN = Pattern.compile("^[A-Za-z0-9+/=]+$");

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public String generateToken(User user) {
        Instant now = Instant.now();
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("userType", user.getUserType());
        claims.put("phoneNumber", user.getPhoneNumber());

        return Jwts.builder()
            .claims(claims)
            .subject(user.getId())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(jwtExpirationMs)))
            .signWith(getSigningKey(), SIG.HS256)
            .compact();
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        String userId = extractUserId(token);
        return userId.equals(user.getId()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        String secret = jwtSecret == null ? "" : jwtSecret.trim();
        if (secret.isEmpty()) {
            throw new IllegalStateException("JWT secret is missing. Set JWT_SECRET or app.jwt.secret");
        }

        byte[] keyBytes;
        if (looksLikeBase64(secret)) {
            try {
                keyBytes = Decoders.BASE64.decode(secret);
            } catch (RuntimeException ex) {
                keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            }
        } else {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) {
            keyBytes = Arrays.copyOf(keyBytes, 32);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private boolean looksLikeBase64(String value) {
        return value.length() % 4 == 0 && BASE64_PATTERN.matcher(value).matches();
    }
}
