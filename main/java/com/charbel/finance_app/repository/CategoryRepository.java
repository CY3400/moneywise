package com.charbel.finance_app.repository;

import com.charbel.finance_app.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
}