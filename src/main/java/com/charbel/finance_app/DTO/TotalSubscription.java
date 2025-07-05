package com.charbel.finance_app.DTO;

import java.sql.Date;

public class TotalSubscription {
    private Long id;
    private String description;
    private Long amount;
    private int paid;
    private int isRepeat;
    private Long descId;
    private Date datePaid;

    public TotalSubscription(Long id, String description, Long amount, int paid, int isRepeat, Long descId, Date datePaid){
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.paid = paid;
        this.isRepeat = isRepeat;
        this.descId = descId;
        this.datePaid = datePaid;
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

    public int getPaid(){
        return paid;
    }

    public void setPaid(int paid){
        this.paid = paid;
    }

    public int getRepeat(){
        return isRepeat;
    }

    public void setRepeat(int isRepeat){
        this.isRepeat = isRepeat;
    }

    public Long getDescId(){
        return descId;
    }

    public void setDescId(Long descId){
        this.descId = descId;
    }

    public Date getDatePaid(){
        return datePaid;
    }

    public void setDatePaid(Date datePaid){
        this.datePaid = datePaid;
    }
}
