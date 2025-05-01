package com.charbel.finance_app.DTO;

public class MostCountDTO {
    private String description;
    private Long count;

    public MostCountDTO(String description, Long count){
        this.description = description;
        this.count = count;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public Long getCount(){
        return count;
    }

    public void setCount(Long count){
        this.count = count;
    }
}