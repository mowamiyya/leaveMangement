package com.manipro.leavemanagement.security;

import com.manipro.leavemanagement.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();
        
        logger.info("JWT Filter - Request: " + requestMethod + " " + requestPath);
        
        // Skip JWT processing for public endpoints
        if (requestPath.startsWith("/api/auth/") || requestPath.startsWith("/api/public/")) {
            logger.debug("Skipping JWT filter for public endpoint: " + requestPath);
            chain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");
        logger.info("Authorization header present: " + (authorizationHeader != null ? "Yes" : "No"));
        
        if (authorizationHeader == null) {
            logger.warn("No Authorization header found for protected endpoint: " + requestPath);
            chain.doFilter(request, response);
            return;
        }

        String username = null;
        String jwt = null;
        String role = null;

        if (authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            logger.debug("JWT token extracted (length: " + jwt.length() + ")");
            try {
                username = jwtUtil.extractUsername(jwt);
                role = jwtUtil.extractRole(jwt);
                logger.info("JWT extracted - Username: " + username + ", Role: " + role + " for path: " + requestPath);
            } catch (Exception e) {
                logger.error("JWT parsing error for request: " + requestPath, e);
                chain.doFilter(request, response);
                return;
            }
        } else {
            logger.warn("Authorization header does not start with 'Bearer ' for: " + requestPath);
            chain.doFilter(request, response);
            return;
        }

        if (username != null && role != null) {
            try {
                if (jwtUtil.validateToken(jwt, username)) {
                    String authority = "ROLE_" + role;
                    logger.info("Setting authentication with authority: " + authority + " for user: " + username + " on path: " + requestPath);
                    
                    // Always set authentication, even if it already exists (to ensure it's fresh)
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, Collections.singletonList(new SimpleGrantedAuthority(authority)));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Get or create SecurityContext
                    SecurityContext context = SecurityContextHolder.getContext();
                    if (context == null) {
                        context = SecurityContextHolder.createEmptyContext();
                        SecurityContextHolder.setContext(context);
                    }
                    context.setAuthentication(authToken);
                    
                    logger.info("Authentication successfully set for user: " + username + " with role: " + role + " on path: " + requestPath);
                    
                    // Verify authentication was set
                    Authentication setAuth = SecurityContextHolder.getContext().getAuthentication();
                    if (setAuth != null && setAuth.isAuthenticated()) {
                        logger.info("Verification - Authentication in context: " + setAuth.getAuthorities() + ", Authenticated: " + setAuth.isAuthenticated() + " for path: " + requestPath);
                    } else {
                        logger.error("ERROR - Authentication was NOT properly set in SecurityContext for path: " + requestPath);
                    }
                } else {
                    logger.warn("JWT token validation failed for user: " + username + " on path: " + requestPath);
                }
            } catch (Exception e) {
                logger.error("Error validating JWT token for path: " + requestPath, e);
            }
        } else {
            logger.warn("Username or role is null - Username: " + username + ", Role: " + role + " for path: " + requestPath);
        }
        
        // Always continue the filter chain, even if authentication failed
        // Spring Security will handle the authorization check
        chain.doFilter(request, response);
    }
}
