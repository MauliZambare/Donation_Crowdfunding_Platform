package com.crowdfund.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;

    // New field
    private String userType; // "donor" किंवा "ngo"

    // Optional bank details (for NGO)
    private String bankAccount;
    private String bankIFSC;
}

