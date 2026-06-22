package com.music.product_service.exceptions;

public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String productId, int requested, int available) {
        super("Estoque insuficiente para o produto " + productId
                + " (solicitado=" + requested + ", disponível=" + available + ")");
    }
}
