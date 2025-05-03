package com.charbel.finance_app.repository;
import com.charbel.finance_app.model.Description;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DescriptionRepository extends JpaRepository<Description, Long> {
    @Query(value="SELECT * FROM DESCRIPTION WHERE (LOWER(DESCRIPTION) LIKE CONCAT('%', LOWER(:description), '%') OR :description IS NULL) AND (TYPE = :type OR :type IS NULL) ORDER BY DESCRIPTION",nativeQuery = true)
    List<Description> findDescriptionByNameOrType(@Param("description") String description, @Param("type") Integer type);
}