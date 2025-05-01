package com.charbel.finance_app.DTO;

import java.time.LocalDate;

public class MostDepensiveDayDTO {
    private LocalDate date;
    private Long amount;

    public MostDepensiveDayDTO(LocalDate date, Long amount){
        this.date = date;
        this.amount = amount;
    }

    public LocalDate getDate(){
        return date;
    }

    public void setDescription(LocalDate date){
        this.date = date;
    }

    public Long getAmount(){
        return amount;
    }

    public void setAmount(Long amount){
        this.amount = amount;
    }
}