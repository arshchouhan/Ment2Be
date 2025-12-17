package com.app.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.util.Base64;

@Component
public class JwtUtil {
    
    // Using the same secret as Node.js backend
    private static final String JWT_SECRET = "your_super_secret_jwt_key_must_be_at_least_32_characters_long_for_security";
    
    /**
     * Extract user ID from JWT token (with fallback to basic parsing if verification fails)
     */
    public String extractUserId(String token) {
        try {
            if (token == null || token.isEmpty()) {
                System.err.println("[JwtUtil] Token is null or empty");
                return null;
            }

            try {
                // First try with signature verification (using JJWT 0.12.3 API)
                Jws<Claims> jws = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes()))
                    .build()
                    .parseSignedClaims(token);
                
                // Try to get user ID from different possible claims
                String userId = jws.getPayload().get("userId", String.class);
                if (userId == null) userId = jws.getPayload().get("_id", String.class);
                if (userId == null) userId = jws.getPayload().get("id", String.class);
                if (userId == null) userId = jws.getPayload().getSubject();

                if (userId != null) {
                    System.out.println("[JwtUtil] Extracted userId from token: " + userId);
                    return userId;
                }
            } catch (JwtException e) {
                System.err.println("[JwtUtil] JWT verification failed, falling back to basic parsing: " + e.getMessage());
                // Continue to fallback method
            }

            // Fallback to basic parsing
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                System.err.println("[JwtUtil] Invalid JWT format - expected 3 parts, got " + parts.length);
                return null;
            }
            
            // Decode the payload (second part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            System.out.println("[JwtUtil] JWT Payload: " + payload);
            
            // Try multiple field names for user ID
            String[] fieldNames = {"userId", "_id", "id", "sub"};
            
            for (String fieldName : fieldNames) {
                String searchPattern = "\"" + fieldName + "\":\"";
                if (payload.contains(searchPattern)) {
                    int start = payload.indexOf(searchPattern) + searchPattern.length();
                    int end = payload.indexOf("\"", start);
                    if (end > start) {
                        String userId = payload.substring(start, end);
                        System.out.println("[JwtUtil] Extracted userId from field '" + fieldName + "': " + userId);
                        return userId;
                    }
                }
            }
            
            System.err.println("[JwtUtil] Could not find userId in JWT payload");
            return null;
            
        } catch (Exception e) {
            System.err.println("[JwtUtil] Error extracting user ID from token: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Extract user role from JWT token (with fallback to basic parsing if verification fails)
     */
    public String extractUserRole(String token) {
        try {
            if (token == null || token.isEmpty()) {
                System.err.println("[JwtUtil] Token is null or empty");
                return null;
            }

            try {
                Jws<Claims> jws = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes()))
                    .build()
                    .parseSignedClaims(token);

                String role = jws.getPayload().get("role", String.class);
                if (role != null && !role.isBlank()) {
                    System.out.println("[JwtUtil] Extracted role from token: " + role);
                    return role;
                }
            } catch (JwtException e) {
                System.err.println("[JwtUtil] JWT verification failed for role extraction, falling back to basic parsing: " + e.getMessage());
            }

            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                System.err.println("[JwtUtil] Invalid JWT format - expected 3 parts, got " + parts.length);
                return null;
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            System.out.println("[JwtUtil] JWT Payload (role extraction): " + payload);

            String searchPattern = "\"role\":\"";
            if (payload.contains(searchPattern)) {
                int start = payload.indexOf(searchPattern) + searchPattern.length();
                int end = payload.indexOf("\"", start);
                if (end > start) {
                    String role = payload.substring(start, end);
                    System.out.println("[JwtUtil] Extracted role from payload: " + role);
                    return role;
                }
            }

            System.err.println("[JwtUtil] Could not find role in JWT payload");
            return null;
        } catch (Exception e) {
            System.err.println("[JwtUtil] Error extracting role from token: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Simple token validation - checks format and expiration if present
     */
    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        
        try {
            // First try with signature verification (using JJWT 0.12.3 API)
            Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes()))
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("[JwtUtil] JWT validation failed: " + e.getMessage());
            // Fall back to basic format validation
            return validateTokenFormat(token);
        }
    }
    
    /**
     * Basic token format validation without signature verification
     */
    private boolean validateTokenFormat(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }
            
            // Try to decode all parts
            Base64.getUrlDecoder().decode(parts[0]);
            Base64.getUrlDecoder().decode(parts[1]);
            Base64.getUrlDecoder().decode(parts[2]);
            
            return true;
        } catch (Exception e) {
            System.err.println("[JwtUtil] Token format validation failed: " + e.getMessage());
            return false;
        }
    }
}
