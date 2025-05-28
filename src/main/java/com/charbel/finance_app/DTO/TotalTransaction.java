package com.charbel.finance_app.DTO;

import java.sql.Date;

public class TotalTransaction {
    private Long id;
    private String description;
    private Long amount;
    private String category;
    private Date dateTransaction;

    public TotalTransaction(Long id, String description, Long amount, String category, Date dateTransaction){
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.dateTransaction = dateTransaction;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public Long getAmount(){
        return amount;
    }

    public void setAmount(Long amount){
        this.amount = amount;
    }

    public String getCategory(){
        return category;
    }

    public void setCategory(String category){
        this.category = category;
    }

    public Date getDate(){
        return dateTransaction;
    }

    public void setDate(Date dateTransaction){
        this.dateTransaction = dateTransaction;
    }
}
