package com.king.backend.global.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class ExecutionTimeAspect {

    @Around("@annotation(LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.nanoTime();
        Object proceed = joinPoint.proceed();
        long end = System.nanoTime();

        long duration = (end - start) / 1_000_000;
        log.info("{} 실행시간: {}ms (args: {})", joinPoint.getSignature().getName(), duration, Arrays.toString(joinPoint.getArgs()));

        return proceed;
    }
}
