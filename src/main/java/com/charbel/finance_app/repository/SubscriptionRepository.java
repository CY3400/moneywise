package com.charbel.finance_app.repository;

import com.charbel.finance_app.DTO.TotalSubscription;
import com.charbel.finance_app.model.Description;
import com.charbel.finance_app.model.Subscription;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    @Query(value="select * from finance_db.subscription WHERE PAID = :paid AND MONTH(date_finance) = MONTH(CURRENT_DATE) AND YEAR(date_finance) = YEAR(CURRENT_DATE)",nativeQuery = true)
    List<Subscription> findByPaid(@Param("paid") int paid);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO SUBSCRIPTION(AMOUNT, DATE_FINANCE, DESC_ID, PAID, IS_REPEAT) SELECT AMOUNT, NOW(), DESC_ID, 0, 1 FROM SUBSCRIPTION WHERE IS_REPEAT = 1 AND ((MONTH(DATE_FINANCE) = MONTH(current_date())-1 AND MONTH(CURRENT_DATE()) != 1) OR (YEAR(DATE_FINANCE) = YEAR(current_date())-1 AND MONTH(CURRENT_DATE()) = 1))", nativeQuery = true)
    void insertSubscriptionsForNewMonth();

    @Query(value="select sub.id, d.description, amount, paid, is_repeat from finance_db.subscription sub inner join finance_db.description d on d.id = sub.desc_id WHERE MONTH(date_finance) = MONTH(CURRENT_DATE) AND YEAR(date_finance) = YEAR(CURRENT_DATE)",nativeQuery = true)
    List<TotalSubscription> findSubscriptionsByMonth();

    @Query(value = "SELECT * FROM FINANCE_DB.DESCRIPTION WHERE type in (2,3) order by description", nativeQuery = true)
    List<Description> findSubscriptionsByDescription();

    @Query(value = "Select count(*) from finance_db.subscription where date_finance = :date", nativeQuery = true)
    Long existsByDate(LocalDate date);
}