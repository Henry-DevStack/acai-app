package com.acai.app.service;

import com.acai.app.domain.CustomerOrder;
import com.acai.app.domain.Ingredient;
import com.acai.app.domain.IngredientType;
import com.acai.app.domain.ItemKind;
import com.acai.app.domain.OrderItem;
import com.acai.app.domain.OrderStatus;
import com.acai.app.domain.Product;
import com.acai.app.domain.Size;
import com.acai.app.repository.IngredientRepository;
import com.acai.app.repository.OrderRepository;
import com.acai.app.repository.ProductRepository;
import com.acai.app.repository.SizeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cria pedidos aplicando as regras do cardápio no servidor: confere disponibilidade,
 * limite de complementos e recalcula o total, sem confiar no que o app mandou.
 */
@Service
public class OrderService {

    private static final ZoneId STORE_ZONE = ZoneId.of("America/Sao_Paulo");

    public record ItemRequest(ItemKind kind, String productId, String sizeId,
                              List<String> complementIds, List<String> extraIds, int quantity) {}

    public record OrderRequest(String customerName, String note, String requestId, List<ItemRequest> items) {}

    private final OrderRepository orders;
    private final SizeRepository sizes;
    private final IngredientRepository ingredients;
    private final ProductRepository products;

    public OrderService(OrderRepository orders, SizeRepository sizes,
                        IngredientRepository ingredients, ProductRepository products) {
        this.orders = orders;
        this.sizes = sizes;
        this.ingredients = ingredients;
        this.products = products;
    }

    // synchronized: o número do dia é sequencial e só há um servidor no MVP.
    @Transactional
    public synchronized CustomerOrder create(OrderRequest request) {
        if (request.requestId() != null) {
            var repeated = orders.findByRequestId(request.requestId());
            if (repeated.isPresent()) {
                return repeated.get();
            }
        }
        if (request.customerName() == null || request.customerName().isBlank()) {
            throw ApiException.badRequest("Informe seu nome");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw ApiException.badRequest("Sua sacola está vazia");
        }

        Map<String, Ingredient> ingredientMap = index(ingredients.findAll(), Ingredient::getId);
        Map<String, Size> sizeMap = index(sizes.findAll(), Size::getId);
        Map<String, Product> productMap = index(products.findAll(), Product::getId);

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (ItemRequest item : request.items()) {
            OrderItem orderItem = item.kind() == ItemKind.PRONTO
                    ? readyItem(item, productMap, sizeMap, ingredientMap)
                    : customItem(item, sizeMap, ingredientMap);
            items.add(orderItem);
            total = total.add(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
        }

        LocalDate today = LocalDate.now(STORE_ZONE);
        CustomerOrder order = new CustomerOrder();
        order.setRequestId(request.requestId());
        order.setBusinessDay(today);
        order.setNumber(orders.countByBusinessDay(today) + 1);
        order.setCustomerName(request.customerName().trim());
        order.setNote(request.note() == null ? "" : request.note().trim());
        order.setItems(items);
        order.setTotal(total);
        return orders.save(order);
    }

    public CustomerOrder get(String id) {
        return orders.findById(id).orElseThrow(() -> ApiException.notFound("Pedido não encontrado"));
    }

    public List<CustomerOrder> list() {
        return orders.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public CustomerOrder changeStatus(String id, OrderStatus next) {
        CustomerOrder order = get(id);
        if (!order.getStatus().canMoveTo(next)) {
            throw ApiException.badRequest("Não dá para mudar de " + order.getStatus() + " para " + next);
        }
        order.setStatus(next);
        return order;
    }

    private OrderItem readyItem(ItemRequest item, Map<String, Product> productMap,
                                Map<String, Size> sizeMap, Map<String, Ingredient> ingredientMap) {
        checkQuantity(item);
        Product product = productMap.get(item.productId());
        if (product == null || !product.isActive()) {
            throw ApiException.badRequest("Produto não encontrado");
        }
        List<Ingredient> recipe = resolve(product.getIngredientIds(), ingredientMap);
        recipe.stream().filter(i -> !i.isAvailable()).findFirst().ifPresent(i -> {
            throw ApiException.badRequest(product.getName() + " está esgotado");
        });
        Size size = sizeMap.get(product.getSizeId());
        String detail = join(size == null ? null : size.getName(), names(recipe));
        return new OrderItem(product.getName(), detail, item.quantity(), product.getPrice());
    }

    private OrderItem customItem(ItemRequest item, Map<String, Size> sizeMap, Map<String, Ingredient> ingredientMap) {
        checkQuantity(item);
        Size size = sizeMap.get(item.sizeId());
        if (size == null) {
            throw ApiException.badRequest("Escolha um tamanho");
        }
        List<Ingredient> complements = resolve(nullSafe(item.complementIds()), ingredientMap);
        List<Ingredient> extras = resolve(nullSafe(item.extraIds()), ingredientMap);
        if (complements.size() > size.getMaxComplements()) {
            throw ApiException.badRequest("Escolha até " + size.getMaxComplements() + " complementos");
        }
        if (complements.stream().anyMatch(i -> i.getType() != IngredientType.COMPLEMENTO)) {
            throw ApiException.badRequest("Complemento inválido");
        }
        if (extras.stream().anyMatch(i -> i.getType() != IngredientType.EXTRA)) {
            throw ApiException.badRequest("Extra inválido");
        }
        List<Ingredient> all = new ArrayList<>(complements);
        all.addAll(extras);
        all.stream().filter(i -> !i.isAvailable()).findFirst().ifPresent(i -> {
            throw ApiException.badRequest(i.getName() + " está esgotado");
        });

        BigDecimal price = extras.stream().map(Ingredient::getExtraPrice).reduce(size.getPrice(), BigDecimal::add);
        String names = all.isEmpty() ? "Sem complementos" : names(all);
        return new OrderItem("Açaí personalizado", join(size.getName(), names), item.quantity(), price);
    }

    private static void checkQuantity(ItemRequest item) {
        if (item.quantity() < 1) {
            throw ApiException.badRequest("Quantidade inválida");
        }
    }

    private static List<Ingredient> resolve(List<String> ids, Map<String, Ingredient> map) {
        return ids.stream().map(id -> {
            Ingredient ingredient = map.get(id);
            if (ingredient == null) {
                throw ApiException.badRequest("Um insumo do pedido não existe mais");
            }
            return ingredient;
        }).toList();
    }

    private static String names(List<Ingredient> list) {
        return list.stream().map(Ingredient::getName).collect(Collectors.joining(", "));
    }

    private static String join(String size, String names) {
        return size == null ? names : size + " • " + names;
    }

    private static List<String> nullSafe(List<String> list) {
        return list == null ? List.of() : list;
    }

    private static <T> Map<String, T> index(List<T> list, Function<T, String> key) {
        return list.stream().collect(Collectors.toMap(key, Function.identity()));
    }
}
