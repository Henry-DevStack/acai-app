package com.acai.app.domain;

public enum IngredientType {
    /** Incluído no preço do tamanho, conta no limite de complementos. */
    COMPLEMENTO,
    /** Pago à parte, não conta no limite. */
    EXTRA
}
