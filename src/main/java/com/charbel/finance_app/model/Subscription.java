package com.charbel.finance_app.model;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "subscription")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private long amount;
    private int paid;
    private int isRepeat;
    private int desc_id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date_finance;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date_paid;

    public Subscription() {}

    public Subscription(long amount, int paid, LocalDate date, int repeat, LocalDate paid_date, int desc_id) {
        this.amount = amount;
        this.paid = paid;
        this.date_finance = date;
        this.isRepeat = repeat;
        this.date_paid = paid_date;
        this.desc_id = desc_id;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public int getPaid() { return paid; }
    public void setPaid(int paid) { this.paid = paid; }

    public LocalDate getDate() { return date_finance; }
    public void setDate(LocalDate date) { this.date_finance = date; }

    public LocalDate getPaidDate() { return date_paid; }
    public void setPaidDate(LocalDate date) { this.date_paid = date; }

    public int getRepeat() { return isRepeat; }
    public void setRepeat(int repeat) { this.isRepeat = repeat; }

    public int getDescId() { return desc_id; }
    public void setDescId(int desc_id) { this.desc_id = desc_id; }
}
