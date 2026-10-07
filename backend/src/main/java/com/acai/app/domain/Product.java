package com.acai.app.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Açaí pronto: uma receita com tamanho fixo, lista de insumos e preço. */
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @NotBlank
    private String name;

    @NotBlank
    private String sizeId;

    @NotEmpty
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_ingredients", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    @Column(name = "ingredient_id")
    private List<String> ingredientIds = new ArrayList<>();

    @NotNull @Min(0)
    private BigDecimal price;

    /** Desligado pelo dono quando quer tirar o pronto do cardápio. */
    private boolean active = true;

    public Product() {}

    public Product(String id, String name, String sizeId, List<String> ingredientIds, BigDecimal price) {
        setId(id);
        this.name = name;
        this.sizeId = sizeId;
        this.ingredientIds = new ArrayList<>(ingredientIds);
        this.price = price;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSizeId() { return sizeId; }
    public void setSizeId(String sizeId) { this.sizeId = sizeId; }
    public List<String> getIngredientIds() { return ingredientIds; }
    public void setIngredientIds(List<String> ingredientIds) { this.ingredientIds = ingredientIds; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
