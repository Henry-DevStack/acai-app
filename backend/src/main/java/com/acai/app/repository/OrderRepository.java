package com.acai.app.repository;

import com.acai.app.domain.CustomerOrder;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<CustomerOrder, String> {

    Optional<CustomerOrder> findByRequestId(String requestId);

    int countByBusinessDay(LocalDate businessDay);

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
}
