package com.crowdfund.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

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

    @Indexed(unique = true, sparse = true)
    @Field("phone_number")
    private String phoneNumber;

    private String userType; // "donor" or "ngo"

    // Optional bank details (for NGO)
    private String bankAccount;
    private String bankIFSC;
}
