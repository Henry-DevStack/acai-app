package com.acai.app.web;

import com.acai.app.domain.CustomerOrder;
import com.acai.app.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Rotas públicas usadas pela tela do cliente. */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orders;

    public OrderController(OrderService orders) {
        this.orders = orders;
    }

    @PostMapping
    public CustomerOrder create(@RequestBody OrderService.OrderRequest request) {
        return orders.create(request);
    }

    @GetMapping("/{id}")
    public CustomerOrder get(@PathVariable String id) {
        return orders.get(id);
    }
}
