package com.charbel.finance_app.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.finance_app.model.Budget;
import com.charbel.finance_app.repository.BudgetRepository;

import jakarta.annotation.PostConstruct;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Transactional
    public void calculerNouveauBudget() {
        Long lastBudget = budgetRepository.getLastMonthBudget();
        Long totalGains = budgetRepository.getTotalGainsLastMonth();
        Long totalDepenses = budgetRepository.getTotalDepensesLastMonth();

        if (lastBudget == null) lastBudget = (long) 0;
        if (totalGains == null) totalGains = (long) 0;
        if (totalDepenses == null) totalDepenses = (long) 0;

        if(totalDepenses < 0){
            totalDepenses *= -1;
        }

        Long nouveauBudget = lastBudget + totalGains - totalDepenses;

        Budget newBudget = new Budget();
        newBudget.setBudget(nouveauBudget);
        newBudget.setDate(LocalDate.now().withDayOfMonth(1));
        budgetRepository.save(newBudget);
    }

    @Scheduled(cron = "0 1 0 1 * ?")
    public void runMonthlyBudgetUpdate() {
        calculerNouveauBudget();
    }

    @PostConstruct
    public void checkMissedExcecution(){
        LocalDate firstofMonth = LocalDate.now().withDayOfMonth(1);

        Long alreadyExecuted = budgetRepository.existsByDate(firstofMonth);

        if(alreadyExecuted == 0){
            System.out.println("⚠️ Tâche manquée ! Exécution maintenant...");
            runMonthlyBudgetUpdate();
        }
    }
}
