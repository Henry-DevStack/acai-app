package com.acai.app.web;

import com.acai.app.domain.CustomerOrder;
import com.acai.app.domain.Ingredient;
import com.acai.app.domain.OrderStatus;
import com.acai.app.domain.Product;
import com.acai.app.domain.Size;
import com.acai.app.service.MenuService;
import com.acai.app.service.OrderService;
import com.acai.app.service.OwnerAuthService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Rotas do painel do dono. Tudo menos /login exige o token (ver OwnerAuthInterceptor). */
@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    public record LoginRequest(String password) {}
    public record StatusRequest(OrderStatus status) {}

    private final OwnerAuthService auth;
    private final OrderService orders;
    private final MenuService menu;

    public OwnerController(OwnerAuthService auth, OrderService orders, MenuService menu) {
        this.auth = auth;
        this.orders = orders;
        this.menu = menu;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {
        return Map.of("token", auth.login(request.password()));
    }

    @GetMapping("/orders")
    public List<CustomerOrder> orders() {
        return orders.list();
    }

    @PatchMapping("/orders/{id}/status")
    public CustomerOrder status(@PathVariable String id, @RequestBody StatusRequest request) {
        return orders.changeStatus(id, request.status());
    }

    @PostMapping("/sizes")
    public Size createSize(@Valid @RequestBody Size size) {
        size.setId(null);
        return menu.saveSize(size);
    }

    @PutMapping("/sizes/{id}")
    public Size updateSize(@PathVariable String id, @Valid @RequestBody Size size) {
        size.setId(id);
        return menu.saveSize(size);
    }

    @PostMapping("/ingredients")
    public Ingredient createIngredient(@Valid @RequestBody Ingredient ingredient) {
        ingredient.setId(null);
        return menu.saveIngredient(ingredient);
    }

    @PutMapping("/ingredients/{id}")
    public Ingredient updateIngredient(@PathVariable String id, @Valid @RequestBody Ingredient ingredient) {
        ingredient.setId(id);
        return menu.saveIngredient(ingredient);
    }

    @DeleteMapping("/ingredients/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIngredient(@PathVariable String id) {
        menu.deleteIngredient(id);
    }

    @PostMapping("/products")
    public Product createProduct(@Valid @RequestBody Product product) {
        product.setId(null);
        return menu.saveProduct(product);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable String id, @Valid @RequestBody Product product) {
        product.setId(id);
        return menu.saveProduct(product);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable String id) {
        menu.deleteProduct(id);
    }
}
