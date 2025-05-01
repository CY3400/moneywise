package com.charbel.finance_app.DTO;

public class TopTransactionDTO {
    private String description;
    private Long amount;

    public TopTransactionDTO(String description, Long amount){
        this.description = description;
        this.amount = amount;
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
}
