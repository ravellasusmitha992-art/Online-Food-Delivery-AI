package com.fooddelivery.exception;

/**
 * Thrown when an authenticated user attempts to access resources they do not own.
 */
public class ForbiddenOperationException extends RuntimeException {

    public ForbiddenOperationException(String message) {
        super(message);
    }
}
