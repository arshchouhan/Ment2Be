package com.app.karma;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class KarmaAspect {
    private static final Logger logger = LoggerFactory.getLogger(KarmaAspect.class);

    /**
     * Log before karma calculation starts
     */
    @Before("execution(* com.app.karma.KarmaService.calculateTotalKarma(..))")
    public void logBeforeKarmaCalculation(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof KarmaService.KarmaCalculationRequest) {
            KarmaService.KarmaCalculationRequest request = (KarmaService.KarmaCalculationRequest) args[0];
            logger.info("🔍 AOP - Starting karma calculation for request: {}", request);
        } else {
            logger.info("🔍 AOP - Starting karma calculation");
        }
    }

    /**
     * Log after karma calculation completes
     */
    @AfterReturning(
        pointcut = "execution(* com.app.karma.KarmaService.calculateTotalKarma(..))",
        returning = "result"
    )
    public void logAfterKarmaCalculation(JoinPoint joinPoint, Object result) {
        logger.info("✅ AOP - Karma calculation completed. Total points: {}", result);
    }

    /**
     * Log profile completion karma
     */
    @Before("execution(* com.app.karma.KarmaService.calculateProfileCompleteKarma(..))")
    public void logBeforeProfileComplete(JoinPoint joinPoint) {
        logger.info("🔍 AOP - About to calculate profile completion karma");
    }

    @AfterReturning(
        pointcut = "execution(* com.app.karma.KarmaService.calculateProfileCompleteKarma(..))",
        returning = "result"
    )
    public void logProfileCompleteKarma(Object result) {
        logger.info("🏆 AOP - Profile completion karma awarded: {} points", result);
    }

    /**
     * Log session completion karma
     */
    @AfterReturning(
        pointcut = "execution(* com.app.karma.KarmaService.calculateSessionCompletedKarma(..))",
        returning = "result"
    )
    public void logSessionCompletedKarma(Object result) {
        logger.info("🎯 AOP - Session completion karma awarded: {} points", result);
    }
}
