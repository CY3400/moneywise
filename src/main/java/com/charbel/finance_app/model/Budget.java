package com.charbel.finance_app.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "budget")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private long budget;
    private LocalDate date_budget;

    public Budget() {}

    public Budget(long budget, LocalDate date_budget) {
        this.budget = budget;
        this.date_budget = date_budget;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public long getBudget() { return budget; }
    public void setBudget(long budget) { this.budget = budget; }

    public LocalDate getDate() { return date_budget; }
    public void setDate(LocalDate date) { this.date_budget = date; }
}

