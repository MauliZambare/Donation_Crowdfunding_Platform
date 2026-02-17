package com.crowdfund.backend.dto;

import com.crowdfund.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String phoneNumber;
    private String userType;
    private String bankAccount;
    private String bankIFSC;

    public static UserResponse from(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .userType(user.getUserType())
            .bankAccount(user.getBankAccount())
            .bankIFSC(user.getBankIFSC())
            .build();
    }
}
