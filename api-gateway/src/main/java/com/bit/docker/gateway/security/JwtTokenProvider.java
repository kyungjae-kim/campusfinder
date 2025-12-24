package com.bit.docker.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtTokenProvider {
    private final Key key;

    public JwtTokenProvider(@Value("${jwt.secret}") String secret) {
        String base64 = java.util.Base64.getEncoder().encodeToString(secret.getBytes());
        byte[] keyBytes = Decoders.BASE64.decode(base64);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims parseCliams(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}












