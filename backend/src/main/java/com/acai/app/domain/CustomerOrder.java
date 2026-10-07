package com.acai.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class CustomerOrder extends BaseEntity {

    /** Gerado pelo app do cliente; um segundo envio igual devolve o mesmo pedido. */
    @JsonIgnore
    @Column(unique = true)
    private String requestId;

    /** Número curto do dia (#001, #002…), chamado no balcão. */
    private int number;

    @JsonIgnore
    private LocalDate businessDay;

    private String customerName;
    private String note;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    @OrderColumn(name = "position")
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.RECEBIDO;

    private Instant createdAt = Instant.now();

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }
    public LocalDate getBusinessDay() { return businessDay; }
    public void setBusinessDay(LocalDate businessDay) { this.businessDay = businessDay; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
