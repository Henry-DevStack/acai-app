package com.acai.app.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "ingredients")
public class Ingredient extends BaseEntity {

    @NotBlank
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    private IngredientType type;

    @Min(0)
    private BigDecimal extraPrice = BigDecimal.ZERO;

    /** Desligado pelo dono quando acaba no estoque. */
    private boolean available = true;

    private String emoji;

    public Ingredient() {}

    public Ingredient(String id, String name, IngredientType type, BigDecimal extraPrice, String emoji) {
        setId(id);
        this.name = name;
        this.type = type;
        this.extraPrice = extraPrice;
        this.emoji = emoji;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public IngredientType getType() { return type; }
    public void setType(IngredientType type) { this.type = type; }
    public BigDecimal getExtraPrice() { return extraPrice; }
    public void setExtraPrice(BigDecimal extraPrice) { this.extraPrice = extraPrice; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
}
