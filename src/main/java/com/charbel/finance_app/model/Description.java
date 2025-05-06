package com.charbel.finance_app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "description")
public class Description {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private int type;

    private int status = 2;

    public Description() {}

    public Description(String description, int type) {
        this.description = description;
        this.type = type;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getType() { return type; }
    public void setType(int type) { this.type = type; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}
