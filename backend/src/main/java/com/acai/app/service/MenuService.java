package com.acai.app.service;

import com.acai.app.domain.Ingredient;
import com.acai.app.domain.Product;
import com.acai.app.domain.Size;
import com.acai.app.repository.IngredientRepository;
import com.acai.app.repository.ProductRepository;
import com.acai.app.repository.SizeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MenuService {

    public record Menu(List<Size> sizes, List<Ingredient> ingredients, List<Product> products) {}

    private final SizeRepository sizes;
    private final IngredientRepository ingredients;
    private final ProductRepository products;

    public MenuService(SizeRepository sizes, IngredientRepository ingredients, ProductRepository products) {
        this.sizes = sizes;
        this.ingredients = ingredients;
        this.products = products;
    }

    @Transactional(readOnly = true)
    public Menu getMenu() {
        return new Menu(sizes.findAll(), ingredients.findAll(), products.findAll());
    }

    public Size saveSize(Size size) {
        return sizes.save(size);
    }

    public Ingredient saveIngredient(Ingredient ingredient) {
        return ingredients.save(ingredient);
    }

    @Transactional
    public void deleteIngredient(String id) {
        boolean inUse = products.findAll().stream().anyMatch(p -> p.getIngredientIds().contains(id));
        if (inUse) {
            throw ApiException.badRequest("Esse insumo está em um açaí pronto. Tire ele da receita primeiro.");
        }
        ingredients.deleteById(id);
    }

    public Product saveProduct(Product product) {
        if (!sizes.existsById(product.getSizeId())) {
            throw ApiException.badRequest("Tamanho não encontrado");
        }
        if (ingredients.findAllById(product.getIngredientIds()).size() != product.getIngredientIds().size()) {
            throw ApiException.badRequest("A receita tem um insumo que não existe");
        }
        return products.save(product);
    }

    public void deleteProduct(String id) {
        products.deleteById(id);
    }
}
