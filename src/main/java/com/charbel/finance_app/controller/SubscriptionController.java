package com.charbel.finance_app.controller;

import com.charbel.finance_app.DTO.TotalSubscription;
import com.charbel.finance_app.model.Description;
import com.charbel.finance_app.model.Subscription;
import com.charbel.finance_app.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @PostMapping
    public Subscription addSubscription(@RequestBody Subscription subscription) {
        return subscriptionRepository.save(subscription);
    }

    @GetMapping
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Subscription getSubscriptionById(@PathVariable Long id) {
        return subscriptionRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Subscription updateSubscription(@PathVariable Long id, @RequestBody Subscription subscriptionDetails) {
    Subscription subscription = subscriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subscription not found with id " + id));

    subscription.setDescId(subscriptionDetails.getDescId());
    subscription.setAmount(subscriptionDetails.getAmount());
    subscription.setPaid(subscriptionDetails.getPaid());
    subscription.setDate(subscriptionDetails.getDate());
    subscription.setRepeat(subscriptionDetails.getRepeat());
    subscription.setPaidDate(subscriptionDetails.getPaidDate());

    return subscriptionRepository.save(subscription);
    }

    @DeleteMapping("/{id}")
    public String deleteSubscription(@PathVariable Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subscription not found with id " + id));
        subscriptionRepository.delete(subscription);
        return "Subscription with ID " + id + " deleted successfully.";
    }

    @GetMapping("/paid/{paid}")
    public List<Subscription> getSubscriptionsByPaid(@PathVariable int paid) {
        return subscriptionRepository.findByPaid(paid);
    }

    @GetMapping("/per-month")
    public List<TotalSubscription> getSubscriptionsByMonth() {
        return subscriptionRepository.findSubscriptionsByMonth();
    }

    @GetMapping("/desc")
    public List<Description> findSubscriptionsByDescription() {
        return subscriptionRepository.findSubscriptionsByDescription();
    }
}
