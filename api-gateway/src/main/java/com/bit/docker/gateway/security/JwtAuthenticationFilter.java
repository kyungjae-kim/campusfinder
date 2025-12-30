package com.bit.docker.gateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {
    private final JwtTokenProvider jwtTokenProvider;
    private final List<String> whitelistPaths;

    public JwtAuthenticationFilter(
            JwtTokenProvider jwtTokenProvider,
            @Value("${jwt.whitelist-paths:/api/auth/login,/api/auth/register}") String[] whitelistPaths) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.whitelistPaths = Arrays.asList(whitelistPaths);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // http://localhost:8080/###/### 으로 요청이 들어왔을 때
        // /###/### 을 추출하는 코드
        String path = exchange.getRequest().getURI().getPath();
        HttpMethod httpMethod = exchange.getRequest().getMethod();

        // CORS preflight는 무조건 통과
        // pre+flight
        if (HttpMethod.OPTIONS.equals(httpMethod)) {
            return chain.filter(exchange);
        }

        // 화이트리스트 url은 무조건 통과
        for (String w : whitelistPaths) {
            if (path.startsWith(w)) {
                return chain.filter(exchange);
            }
        }

        // 위의 2가지 경우가 아닐 때
        // 무조건 Authorization Header를 검사

        // 1. Header에 AUTHORIZATION Header 추출
        String authHeader =
                exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // 2. 만약 header가 없거나 유효하지 않으면 거절
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // 3. String authHeader에서 "Bearer "를 제거하여 진짜 토큰값만 남김
        String token = authHeader.substring(7);

        // String token을 토대로 Claims 객체 생성
        Claims claims;
        try {
            claims = jwtTokenProvider.parseCliams(token);
        } catch (Exception e) {
            // parse에 실패한 것을 리턴해준다.
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // 사용자의 회원번호, 유저네임, 패스워드 추출
        String userId = claims.getSubject();
        String username = claims.get("username", String.class);
        String nickname = claims.get("nickname", String.class);
        String role = claims.get("role", String.class);
        String status = claims.get("status", String.class);

        // GW에서 각각의 스프링부트로 보낼 요청 준비
        ServerHttpRequest mutated =
                exchange
                        .getRequest()
                        .mutate()
                        .header("X-User-Id", userId)
                        .header("X-Username", username)
                        .header("X-Nickname", nickname)
                        .header("X-User-Role", role)
                        .header("X-User-Status", status)
                        .build();

        ServerWebExchange mutatedExchange
                = exchange.mutate().request(mutated).build();

        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
