package com.music.notification_service.kafka;

import com.music.notification_service.models.Notification;
import com.music.notification_service.models.NotificationType;
import com.music.notification_service.repositories.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.support.Acknowledgment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderStatusChangedConsumer — notificação ao mudar status do pedido")
class OrderStatusChangedConsumerTest {

    private static final String ORDER_ID = "6a1f3308710135bb60a1f375";
    private static final String SHORT_ID = "6a1f3308";
    private static final String USER_ID  = "user-123";

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private Acknowledgment ack;

    @InjectMocks
    private OrderStatusChangedConsumer consumer;

    private OrderStatusChangedEvent event(String newStatus, String trackingCode, String carrier) {
        return new OrderStatusChangedEvent(ORDER_ID, USER_ID, "PENDING", newStatus, trackingCode, carrier);
    }

    @BeforeEach
    void setUpDefaults() {
        lenient().when(notificationRepository.existsByDedupKey(any())).thenReturn(false);
    }

    @Nested
    @DisplayName("cria notificação com tipo e mensagem corretos por status")
    class CriaNotificacaoPorStatus {

        @Test
        @DisplayName("CONFIRMED → ORDER_CONFIRMED + mensagem 'Pedido #... confirmado.'")
        void confirmed() {
            consumer.consume(event("CONFIRMED", null, null), ack);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());
            Notification n = captor.getValue();

            assertThat(n.getUserId()).isEqualTo(USER_ID);
            assertThat(n.getType()).isEqualTo(NotificationType.ORDER_CONFIRMED);
            assertThat(n.getMessage()).isEqualTo("Pedido #" + SHORT_ID + " confirmado.");
            assertThat(n.getDedupKey()).isEqualTo("order-status:" + ORDER_ID + ":CONFIRMED");
            verify(ack).acknowledge();
        }

        @Test
        @DisplayName("SHIPPED com trackingCode → ORDER_SHIPPED + mensagem com código e transportadora")
        void shippedComRastreio() {
            consumer.consume(event("SHIPPED", "BR123456789MS", "Correios"), ack);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());
            Notification n = captor.getValue();

            assertThat(n.getType()).isEqualTo(NotificationType.ORDER_SHIPPED);
            assertThat(n.getMessage())
                    .isEqualTo("Pedido #" + SHORT_ID + " enviado. Rastreio Correios: BR123456789MS");
            verify(ack).acknowledge();
        }

        @Test
        @DisplayName("SHIPPED sem trackingCode → ORDER_SHIPPED + mensagem simples 'enviado.'")
        void shippedSemRastreio() {
            consumer.consume(event("SHIPPED", null, null), ack);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());

            assertThat(captor.getValue().getMessage()).isEqualTo("Pedido #" + SHORT_ID + " enviado.");
            verify(ack).acknowledge();
        }

        @Test
        @DisplayName("DELIVERED → ORDER_DELIVERED + mensagem 'entregue.'")
        void delivered() {
            consumer.consume(event("DELIVERED", null, null), ack);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());
            Notification n = captor.getValue();

            assertThat(n.getType()).isEqualTo(NotificationType.ORDER_DELIVERED);
            assertThat(n.getMessage()).isEqualTo("Pedido #" + SHORT_ID + " entregue.");
            verify(ack).acknowledge();
        }

        @Test
        @DisplayName("CANCELLED → ORDER_CANCELLED + mensagem 'cancelado.'")
        void cancelled() {
            consumer.consume(event("CANCELLED", null, null), ack);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());
            Notification n = captor.getValue();

            assertThat(n.getType()).isEqualTo(NotificationType.ORDER_CANCELLED);
            assertThat(n.getMessage()).isEqualTo("Pedido #" + SHORT_ID + " cancelado.");
            verify(ack).acknowledge();
        }

        @Test
        @DisplayName("status desconhecido → GENERAL + mensagem genérica")
        void statusDesconhecido() {
            consumer.consume(event("WEIRD_STATUS", null, null), ack);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());
            Notification n = captor.getValue();

            assertThat(n.getType()).isEqualTo(NotificationType.GENERAL);
            assertThat(n.getMessage()).contains("atualizado para WEIRD_STATUS");
            verify(ack).acknowledge();
        }
    }

    @Nested
    @DisplayName("idempotência via dedupKey")
    class Idempotencia {

        @Test
        @DisplayName("dedupKey já existe → não salva e ainda assim acknowledge (commit do offset)")
        void dedupKeyJaProcessado() {
            when(notificationRepository.existsByDedupKey("order-status:" + ORDER_ID + ":DELIVERED"))
                    .thenReturn(true);

            consumer.consume(event("DELIVERED", null, null), ack);

            verify(notificationRepository, never()).save(any());
            verify(ack).acknowledge();
        }

        @Test
        @DisplayName("save lança DuplicateKeyException (race) → ignora silenciosamente e acknowledge")
        void raceCondition() {
            when(notificationRepository.save(any()))
                    .thenThrow(new DuplicateKeyException("dup key"));
            consumer.consume(event("SHIPPED", "BR987", "Correios"), ack);

            verify(notificationRepository, times(1)).save(any());
            verify(ack).acknowledge();
        }
    }

    @Nested
    @DisplayName("validação de evento inválido (vai pro retry/DLT)")
    class EventoInvalido {

        @Test
        @DisplayName("evento null → IllegalArgumentException, sem save e sem ack")
        void eventoNull() {
            assertThatThrownBy(() -> consumer.consume(null, ack))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(notificationRepository, never()).save(any());
            verify(ack, never()).acknowledge();
        }

        @Test
        @DisplayName("orderId null → IllegalArgumentException")
        void orderIdNull() {
            OrderStatusChangedEvent bad = new OrderStatusChangedEvent(
                    null, USER_ID, "PENDING", "SHIPPED", null, null);

            assertThatThrownBy(() -> consumer.consume(bad, ack))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(notificationRepository, never()).save(any());
            verify(ack, never()).acknowledge();
        }

        @Test
        @DisplayName("newStatus null → IllegalArgumentException")
        void newStatusNull() {
            OrderStatusChangedEvent bad = new OrderStatusChangedEvent(
                    ORDER_ID, USER_ID, "PENDING", null, null, null);

            assertThatThrownBy(() -> consumer.consume(bad, ack))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(notificationRepository, never()).save(any());
            verify(ack, never()).acknowledge();
        }
    }

    @Nested
    @DisplayName("dedupKey é gerado por (orderId, newStatus) — permite múltiplas notificações no ciclo de vida")
    class DedupKey {

        @Test
        @DisplayName("dois statuses diferentes para o mesmo pedido geram dedupKeys distintos")
        void dedupKeysDistintosPorStatus() {
            consumer.consume(event("SHIPPED", "BR1", "Correios"), ack);
            consumer.consume(event("DELIVERED", null, null), ack);

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository, times(2)).save(captor.capture());

            assertThat(captor.getAllValues())
                    .extracting(Notification::getDedupKey)
                    .containsExactly(
                            "order-status:" + ORDER_ID + ":SHIPPED",
                            "order-status:" + ORDER_ID + ":DELIVERED"
                    );
        }
    }
}
