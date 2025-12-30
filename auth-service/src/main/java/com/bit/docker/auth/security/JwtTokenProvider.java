package com.bit.docker.auth.security;

import com.bit.docker.auth.model.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final Key key;
    private final long expiration;

    public JwtTokenProvider(@Value("${jwt.secret}")String secret, @Value("${jwt.expiration-millis}")long expiration) {
        String base64 = java.util.Base64.getEncoder().encodeToString(secret.getBytes());
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64));
        this.expiration = expiration;
    }

    public String createToken(Long userId, String username, String nickname, UserRole role, com.bit.docker.auth.model.UserStatus status) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .claim("nickname", nickname)
                .claim("role", role.name())
                .claim("status", status.name())
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @SuppressWarnings("unused")
    public Claims parseClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
