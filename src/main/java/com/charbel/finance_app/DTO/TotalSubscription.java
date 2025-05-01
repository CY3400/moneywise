package com.charbel.finance_app.DTO;

public class TotalSubscription {
    private Long id;
    private String description;
    private Long amount;
    private int paid;
    private int isRepeat;

    public TotalSubscription(Long id, String description, Long amount, int paid, int isRepeat){
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.paid = paid;
        this.isRepeat = isRepeat;
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
}
