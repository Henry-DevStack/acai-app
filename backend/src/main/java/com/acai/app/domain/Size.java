package com.acai.app.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "sizes")
public class Size extends BaseEntity {

    @NotBlank
    private String name;

    @NotNull @Min(0)
    private BigDecimal price;

    @Min(0)
    private int maxComplements;

    public Size() {}

    public Size(String id, String name, BigDecimal price, int maxComplements) {
        setId(id);
        this.name = name;
        this.price = price;
        this.maxComplements = maxComplements;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public int getMaxComplements() { return maxComplements; }
    public void setMaxComplements(int maxComplements) { this.maxComplements = maxComplements; }
}
