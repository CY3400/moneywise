package com.charbel.finance_app.repository;

import com.charbel.finance_app.model.Budget;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;


public interface BudgetRepository extends JpaRepository<Budget, Long> {
    @Query(value="SELECT b.budget FROM budget b WHERE b.date_budget = (SELECT MAX(b2.date_budget) FROM finance_db.Budget b2);", nativeQuery = true)
    Long getLastMonthBudget();

    @Query(value = "SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.cat_id = 1 AND MONTH(t.date_transaction) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) AND YEAR(t.date_transaction) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)", nativeQuery = true)
    Long getTotalGainsLastMonth();

    @Query(value = "SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.cat_id != 1 AND MONTH(t.date_transaction) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) AND YEAR(t.date_transaction) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)", nativeQuery = true)
    Long getTotalDepensesLastMonth();

    @Query(value="select * from finance_db.budget WHERE MONTH(date_budget) = MONTH(CURRENT_DATE) AND YEAR(date_budget) = YEAR(CURRENT_DATE)",nativeQuery = true)
    List<Budget> findBudgetByMonth();

    @Query(value="select count(*) from finance_db.budget WHERE date_budget = :date",nativeQuery = true)
    Long existsByDate(LocalDate date);
}