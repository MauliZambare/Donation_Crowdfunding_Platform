package com.crowdfund.backend.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowdfund.backend.service.ReceiptService;

@RestController
@RequestMapping("/api/receipt")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping("/download/{paymentId}")
    public ResponseEntity<ByteArrayResource> downloadReceipt(@PathVariable String paymentId) {
        return receiptService.findByPaymentId(paymentId)
            .map(receipt -> {
                byte[] pdfBytes = receiptService.generateReceiptPdf(receipt);
                ByteArrayResource resource = new ByteArrayResource(pdfBytes);

                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receipt-" + paymentId + ".pdf")
                    .contentLength(pdfBytes.length)
                    .body(resource);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
