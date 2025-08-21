package com.crowdfund.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crowdfund.backend.model.User;
import com.crowdfund.backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) throws Exception {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new Exception("User with this email already exists!");
        }
        return userRepository.save(user);
    }

public Optional<User> loginUser(String email, String password) {
    Optional<User> user = userRepository.findByEmail(email);
    if(user.isPresent() && user.get().getPassword().equals(password)) {
        return user;
    } else {
        return Optional.empty();
    }
}

}
