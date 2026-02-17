package com.crowdfund.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class OtpServiceException extends RuntimeException {

    private final HttpStatus status;

    public OtpServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status == null ? HttpStatus.BAD_REQUEST : status;
    }
}
