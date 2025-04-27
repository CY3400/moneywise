package com.charbel.finance_app.controller;

import com.charbel.finance_app.model.Budget;
import com.charbel.finance_app.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @PostMapping
    public Budget addBudget(@RequestBody Budget budget) {
        return budgetRepository.save(budget);
    }

    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    @GetMapping("/{id}")
    public Budget getBudgetById(@PathVariable Long id) {
        return budgetRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Long id, @RequestBody Budget budgetDetails) {
    Budget budget = budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
    budget.setBudget(budgetDetails.getBudget());
    budget.setDate(budgetDetails.getDate());

    return budgetRepository.save(budget);
    }

    @DeleteMapping("/{id}")
    public String deleteBudget(@PathVariable Long id) {
        Budget budget = budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
        budgetRepository.delete(budget);
        return "Budget with ID " + id + " deleted successfully.";
    }

    @GetMapping("/per-month")
    public List<Budget> findBudgetByMonth() {
        return budgetRepository.findBudgetByMonth();
    }
}
