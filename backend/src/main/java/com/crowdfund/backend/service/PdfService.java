package com.crowdfund.backend.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.crowdfund.backend.model.Receipt;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public byte[] generateReceiptPdf(Receipt receipt) {
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("Donation Receipt", titleFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Donor Name: " + receipt.getDonorName(), bodyFont));
            document.add(new Paragraph("Donor Email: " + receipt.getDonorEmail(), bodyFont));
            document.add(new Paragraph("Donor Phone: " + receipt.getDonorPhone(), bodyFont));
            document.add(new Paragraph("Donation Amount: INR " + receipt.getAmount(), bodyFont));
            document.add(new Paragraph("Payment ID: " + receipt.getPaymentId(), bodyFont));
            document.add(new Paragraph("Order ID: " + receipt.getOrderId(), bodyFont));

            String donationTime = receipt.getDonationDateTime() == null
                ? "N/A"
                : receipt.getDonationDateTime().format(DATE_TIME_FORMATTER);

            document.add(new Paragraph("Donation Date & Time: " + donationTime, bodyFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Thank you for supporting this campaign.", bodyFont));
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate receipt PDF", ex);
        } finally {
            document.close();
        }

        return outputStream.toByteArray();
    }
}
