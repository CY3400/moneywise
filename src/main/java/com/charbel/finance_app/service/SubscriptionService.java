package com.charbel.finance_app.service;
import jakarta.annotation.PostConstruct;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.charbel.finance_app.repository.SubscriptionRepository;

@Service
public class SubscriptionService{

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository){
        this.subscriptionRepository = subscriptionRepository;
    }

    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void generateMonthlySubscription(){
        System.out.println("📅 Début de la mise à jour des abonnements récurrents...");
        subscriptionRepository.insertSubscriptionsForNewMonth();
        System.out.println("✅ Mise à jour des abonnements récurrents terminée.");
    }

    @PostConstruct
    public void checkMissedExcecution(){
        LocalDate firstofMonth = LocalDate.now().withDayOfMonth(1);

        Long alreadyExecuted = subscriptionRepository.existsByDate(firstofMonth);

        if(alreadyExecuted == 0){
            System.out.println("⚠️ Tâche manquée ! Exécution maintenant...");
            generateMonthlySubscription();
        }
    }
}