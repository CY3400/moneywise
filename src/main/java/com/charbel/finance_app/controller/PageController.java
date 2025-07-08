package com.charbel.finance_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class PageController {

    @GetMapping("/Types_Gains_Dépenses")
    public String showDescriptionPage() {
        return "forward:/Pages/description.html";
    }

    @GetMapping("/Statistiques")
    public String showStatisticPage() {
        return "forward:/Pages/statistics.html";
    }

    @GetMapping("/Transactions")
    public String showTransactionPage() {
        return "forward:/Pages/transaction.html";
    }

    @GetMapping("/Abonnements")
    public String showSubscriptionPage() {
        return "forward:/Pages/subscription.html";
    }
    
    @GetMapping("/Catégories")
    public String showCategoryPage() {
        return "forward:/Pages/category.html";
    }

    @GetMapping("/Budget")
    public String showBudgetPage() {
        return "forward:/Pages/budget.html";
    }
}
