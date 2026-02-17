package com.crowdfund.backend.service;

import java.util.Optional;

import com.crowdfund.backend.dto.UserRegisterRequest;
import com.crowdfund.backend.exception.BadRequestException;
import com.crowdfund.backend.model.User;
import com.crowdfund.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(UserRegisterRequest request) {
        String email = request.getEmail().trim();
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new BadRequestException("User with this email already exists");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            String normalizedPhone = normalizePhoneNumber(request.getPhoneNumber());
            if (userRepository.existsByPhoneNumber(normalizedPhone)) {
                throw new BadRequestException("User with this phone number already exists");
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(normalizeNullablePhone(request.getPhoneNumber()));
        user.setUserType(request.getUserType());
        user.setBankAccount(request.getBankAccount());
        user.setBankIFSC(request.getBankIFSC());

        return userRepository.save(user);
    }

    private String normalizeNullablePhone(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return null;
        }
        return normalizePhoneNumber(phoneNumber);
    }

    private String normalizePhoneNumber(String phoneNumber) {
        String normalized = phoneNumber.trim().replaceAll("[\\s\\-()]", "");
        if (!normalized.matches("^\\+[1-9]\\d{9,14}$")) {
            throw new BadRequestException("phoneNumber must be in E.164 format, e.g. +919876543210");
        }
        return normalized;
    }
}
