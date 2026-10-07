package com.acai.app.domain;

public enum OrderStatus {
    RECEBIDO, PRONTO, ENTREGUE, CANCELADO;

    public boolean canMoveTo(OrderStatus next) {
        return switch (this) {
            case RECEBIDO -> next == PRONTO || next == CANCELADO;
            case PRONTO -> next == ENTREGUE;
            case ENTREGUE, CANCELADO -> false;
        };
    }
}
