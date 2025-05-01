package com.charbel.finance_app.controller;

import com.charbel.finance_app.DTO.MostCountDTO;
import com.charbel.finance_app.DTO.MostDepensiveDayDTO;
import com.charbel.finance_app.DTO.TopTransactionDTO;
import com.charbel.finance_app.DTO.TotalTransaction;
import com.charbel.finance_app.model.Description;
import com.charbel.finance_app.model.Transaction;
import com.charbel.finance_app.repository.TransactionRepository;
import com.charbel.finance_app.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/transaction")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public Transaction addTransaction(@RequestBody Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Transaction getTransactionById(@PathVariable Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Transaction updateSubscription(@PathVariable Long id, @RequestBody Transaction transactionDetails) {
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subscription not found with id " + id));

    transaction.setDescId(transactionDetails.getDescId());
    transaction.setAmount(transactionDetails.getAmount());
    transaction.setCat(transactionDetails.getCat());
    transaction.setDate(transactionDetails.getDate());

    return transactionRepository.save(transaction);
    }

    @DeleteMapping("/{id}")
    public String deleteTransaction(@PathVariable Long id) {
        Transaction subscription = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subscription not found with id " + id));
            transactionRepository.delete(subscription);
        return "Subscription with ID " + id + " deleted successfully.";
    }

    @GetMapping("/category/{catId}")
    public List<Transaction> getTransactionsByCategory(@PathVariable int catId) {
        return transactionRepository.findByCategoryId(catId);
    }

    @GetMapping("/today/{catId}")
    public List<Transaction> getTodayTransactions(@PathVariable int catId) {
        LocalDate today = LocalDate.now();
        return transactionRepository.findByCategoryIdAndDateTransaction(catId, today);
    }

    @GetMapping("/per-month")
    public List<TotalTransaction> getTransactionsByMonth() {
        return transactionRepository.findTransactionsByMonth();
    }
    
    @GetMapping("/desc")
    public List<Description> findTransactionDescriptions() {
        return transactionRepository.findTransactionDescriptions();
    }

    @GetMapping("/months")
    public List<Integer> findDistinctMonths() {
        return transactionRepository.findDistinctMonths();
    }
    
    @GetMapping("/years")
    public List<Integer> findDistinctYears() {
        return transactionRepository.findDistinctYears();
    }

    @GetMapping("/top5")
    public List<TopTransactionDTO> getTop5Transactions(
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year) {
        return transactionService.getTop5Transactions(month, year);
    }

    @GetMapping("/MDD")
    public List<MostDepensiveDayDTO> findDailyExpensive(
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year) {
        return transactionService.findDailyExpensive(month, year);
    }

    @GetMapping("/MC")
    public List<MostCountDTO> findMostCount(
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year) {
        return transactionService.findMostCount(month, year);
    }
}
