package com.charbel.finance_app.repository;

import com.charbel.finance_app.model.Category;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query(value="SELECT * FROM CATEGORY WHERE STATUS = 2 ORDER BY DESCRIPTION",nativeQuery = true)
    List<Category> findAllActives();

    @Query(value="SELECT * FROM CATEGORY WHERE (LOWER(DESCRIPTION) LIKE CONCAT('%', LOWER(:description), '%') OR :description IS NULL) ORDER BY DESCRIPTION",nativeQuery = true)
    List<Category> findCategoryByName(@Param("description") String description);
}