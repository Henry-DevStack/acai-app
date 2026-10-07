package com.acai.app.config;

import com.acai.app.domain.Ingredient;
import com.acai.app.domain.IngredientType;
import com.acai.app.domain.Product;
import com.acai.app.domain.Size;
import com.acai.app.repository.IngredientRepository;
import com.acai.app.repository.ProductRepository;
import com.acai.app.repository.SizeRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Coloca o mesmo cardápio de exemplo do modo protótipo do front quando o banco está vazio.
 * O dono edita ou apaga tudo pelo painel. Desligue com SEED_SAMPLE_DATA=false.
 */
@Component
@ConditionalOnProperty(name = "acai.seed-sample-data", havingValue = "true")
public class SampleDataSeeder implements CommandLineRunner {

    private final SizeRepository sizes;
    private final IngredientRepository ingredients;
    private final ProductRepository products;

    public SampleDataSeeder(SizeRepository sizes, IngredientRepository ingredients, ProductRepository products) {
        this.sizes = sizes;
        this.ingredients = ingredients;
        this.products = products;
    }

    @Override
    public void run(String... args) {
        if (sizes.count() > 0) {
            return;
        }
        sizes.saveAll(List.of(
                new Size("s300", "300 ml", money(18), 3),
                new Size("s500", "500 ml", money(24), 3),
                new Size("s700", "700 ml", money(30), 4)));
        ingredients.saveAll(List.of(
                new Ingredient("banana", "Banana", IngredientType.COMPLEMENTO, money(0), "🍌"),
                new Ingredient("morango", "Morango", IngredientType.COMPLEMENTO, money(0), "🍓"),
                new Ingredient("granola", "Granola", IngredientType.COMPLEMENTO, money(0), "🥣"),
                new Ingredient("pacoca", "Paçoca", IngredientType.COMPLEMENTO, money(0), "🥜"),
                new Ingredient("kiwi", "Kiwi", IngredientType.COMPLEMENTO, money(0), "🥝"),
                new Ingredient("leite-po", "Leite em pó", IngredientType.EXTRA, money(3), "🥛"),
                new Ingredient("leite-cond", "Leite condensado", IngredientType.EXTRA, money(2), "🍯"),
                new Ingredient("avela", "Creme de avelã", IngredientType.EXTRA, money(5), "🌰")));
        products.saveAll(List.of(
                new Product("classico", "Clássico", "s300", List.of("banana", "granola"), money(18)),
                new Product("morango-leite", "Morango & leite", "s500", List.of("morango", "leite-po"), money(26)),
                new Product("tropical", "Tropical", "s500", List.of("banana", "morango", "kiwi"), money(24)),
                new Product("pacoquinha", "Paçoquinha", "s300", List.of("pacoca", "leite-cond"), money(20))));
    }

    private static BigDecimal money(int value) {
        return BigDecimal.valueOf(value);
    }
}
