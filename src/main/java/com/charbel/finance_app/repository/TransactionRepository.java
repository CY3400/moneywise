package com.charbel.finance_app.repository;

import com.charbel.finance_app.DTO.TotalTransaction;
import com.charbel.finance_app.model.Description;
import com.charbel.finance_app.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query(value="SELECT * FROM finance_db.Transaction t WHERE cat_id = :categoryId AND MONTH(t.date_transaction) = MONTH(CURRENT_DATE) AND YEAR(t.date_transaction) = YEAR(CURRENT_DATE)",nativeQuery = true)
    List<Transaction> findByCategoryId(@Param("categoryId") int categoryId);

    List<Transaction> findByCategoryIdAndDateTransaction(int categoryId, LocalDate dateTransaction);

    @Query(value="SELECT t.id, d.id as descID, c.id as catId, d.Description, amount, c.description as category, t.date_transaction FROM finance_db.Transaction t INNER JOIN finance_db.Description d on d.id = t.desc_id INNER JOIN finance_db.Category c on c.id = t.cat_id WHERE DATE_FORMAT(t.date_transaction, '%m/%d/%Y') BETWEEN COALESCE(DATE_FORMAT(:date_from,'%m/%d/%Y'), DATE_FORMAT(SYSDATE(),'%m/%d/%Y')) AND COALESCE(DATE_FORMAT(:date_to,'%m/%d/%Y'), DATE_FORMAT(SYSDATE(),'%m/%d/%Y'))",nativeQuery = true)
    List<TotalTransaction> findTransactionsByMonth(@Param("date_from") Date date_from, @Param("date_to") Date date_to);

    @Query(value = "Select * from finance_db.DESCRIPTION where type in (1,3) and status = 2 order by description", nativeQuery = true)
    List<Description> findTransactionDescriptions();

    @Query(value = "Select month(date_transaction) as M from finance_db.transaction where cat_id != 1 union Select month(date_finance) as M from finance_db.subscription", nativeQuery = true)
    List<Integer> findDistinctMonths();

    @Query(value = "Select distinct year(date_transaction) as Y from finance_db.transaction where cat_id != 1 union Select year(date_finance) as M from finance_db.subscription", nativeQuery = true)
    List<Integer> findDistinctYears();

    @Query(value = "select description, sum(amount) as amount from (select d.description, amount from finance_db.transaction t inner join finance_db.description d on d.id = t.desc_id where cat_id != 1 and desc_id != 1 and (month(date_transaction) = :month or :month is null) and (year(date_transaction) = :year or :year is null) union all select d.description, amount from finance_db.subscription s inner join finance_db.description d on d.id = s.desc_id where (month(date_paid) = :month or :month is null) and (year(date_paid) = :year or :year is null) and date_paid is not null) as Grp group by description order by amount desc limit 5",nativeQuery = true)
    List<Object[]> findTop5(@Param("month") Integer month, @Param("year") Integer year);

    @Query(value = "select date_transaction, sum(amount) as amount from (select date_transaction, amount as amount from finance_db.transaction where cat_id != 1 and desc_id != 1 and (month(date_transaction) = :month or :month is null) and (year(date_transaction) = :year or :year is null) union all select date_paid, amount as amount from finance_db.subscription where (month(date_paid) = :month or :month is null) and (year(date_paid) = :year or :year is null) and date_paid is not null) as Derived group by date_transaction order by amount desc limit 1",nativeQuery = true)
    List<Object[]> findDailyExpensive(@Param("month") Integer month, @Param("year") Integer year);

    @Query(value = "select d.description, count(*) as count, sum(amount) as amount from finance_db.transaction t inner join finance_db.description d on d.id = t.desc_id where cat_id != 1 and desc_id != 1 and (month(date_transaction) = :month or :month is null) and (year(date_transaction) = :year or :year is null) group by description union all select d.description, count(*) as count, sum(amount) as amount from finance_db.subscription t inner join finance_db.description d on d.id = t.desc_id where (month(date_paid) = :month or :month is null) and (year(date_paid) = :year or :year is null) and date_paid is not null group by description order by count desc, amount desc limit 1",nativeQuery = true)
    List<Object[]> findMostCount(@Param("month") Integer month, @Param("year") Integer year);
}
