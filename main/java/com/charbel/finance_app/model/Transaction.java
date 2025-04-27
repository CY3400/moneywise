package com.charbel.finance_app.model;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "transaction")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private long amount;
    @Column(name = "cat_id")
    private int categoryId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(name = "date_transaction")
    private LocalDate dateTransaction;

    private int desc_id;

    public Transaction() {}

    public Transaction(int desc_id, long amount, int cat_id, LocalDate date) {
        this.desc_id = desc_id;
        this.amount = amount;
        this.categoryId = cat_id;
        this.dateTransaction = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public int getCat() { return categoryId; }
    public void setCat(int cat) { this.categoryId = cat; }

    public LocalDate getDate() { return dateTransaction; }
    public void setDate(LocalDate date) { this.dateTransaction = date; }

    public int getDescId() { return desc_id; }
    public void setDescId(int desc_id) { this.desc_id = desc_id; }
}
