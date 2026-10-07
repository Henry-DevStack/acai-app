package com.acai.app.domain;

import jakarta.persistence.Embeddable;
import java.math.BigDecimal;

/**
 * Item como foi comprado. Guarda nome, escolhas e preço do momento,
 * para o pedido não mudar se o dono editar o cardápio depois.
 */
@Embeddable
public class OrderItem {

    private String name;
    private String detail;
    private int quantity;
    private BigDecimal unitPrice;

    protected OrderItem() {}

    public OrderItem(String name, String detail, int quantity, BigDecimal unitPrice) {
        this.name = name;
        this.detail = detail;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public String getName() { return name; }
    public String getDetail() { return detail; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
