package com.manipro.leavemanagement.config;

import com.manipro.leavemanagement.entity.Admin;
import com.manipro.leavemanagement.entity.LeaveStatus;
import com.manipro.leavemanagement.repository.AdminRepository;
import com.manipro.leavemanagement.repository.LeaveStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private LeaveStatusRepository leaveStatusRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeLeaveStatuses();
        initializeAdmin();
    }

    private void initializeLeaveStatuses() {
        if (leaveStatusRepository.findByStatusName("DRAFT").isEmpty()) {
            LeaveStatus draft = new LeaveStatus();
            draft.setStatusName("DRAFT");
            draft.setDescription("Saved but not submitted");
            leaveStatusRepository.save(draft);
        }

        if (leaveStatusRepository.findByStatusName("PENDING").isEmpty()) {
            LeaveStatus pending = new LeaveStatus();
            pending.setStatusName("PENDING");
            pending.setDescription("Submitted, awaiting approval");
            leaveStatusRepository.save(pending);
        }

        if (leaveStatusRepository.findByStatusName("APPROVED").isEmpty()) {
            LeaveStatus approved = new LeaveStatus();
            approved.setStatusName("APPROVED");
            approved.setDescription("Approved by teacher");
            leaveStatusRepository.save(approved);
        }

        if (leaveStatusRepository.findByStatusName("REJECTED").isEmpty()) {
            LeaveStatus rejected = new LeaveStatus();
            rejected.setStatusName("REJECTED");
            rejected.setDescription("Rejected by teacher");
            leaveStatusRepository.save(rejected);
        }
    }

    private void initializeAdmin() {
        if (adminRepository.findByEmail("king@gmail.com").isEmpty()) {
            Admin admin = new Admin();
            admin.setName("King");
            admin.setEmail("king@gmail.com");
            admin.setPassword(passwordEncoder.encode("King@123"));
            admin.setIsActive(true);
            adminRepository.save(admin);
        }
    }
}
