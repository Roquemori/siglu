package com.siglu.repository;

import com.siglu.entity.Colaborador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    Optional<Colaborador> findByDni(String dni);
    boolean existsByDni(String dni);
    
    @Query("SELECT c FROM Colaborador c WHERE " +
           "(:activo IS NULL OR c.activo = :activo) AND " +
           "(LOWER(c.dni) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.apellidoPaterno) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.apellidoMaterno) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Colaborador> searchWithFilters(
        @Param("search") String search,
        @Param("activo") Boolean activo,
        Pageable pageable);
    
    Page<Colaborador> findByActivoTrue(Pageable pageable);
    Page<Colaborador> findByActivoFalse(Pageable pageable);
}
