package com.charbel.finance_app.repository;
import com.charbel.finance_app.model.Description;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DescriptionRepository extends JpaRepository<Description, Long> {
    
}