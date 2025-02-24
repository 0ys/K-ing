package com.king.backend.global.util;

public class ValidationUtil {
    public static boolean checkNotNullAndLengthLimit(String str, int length) {
        return str != null && !str.trim().isEmpty() && str.length() <= length;
    }
}
