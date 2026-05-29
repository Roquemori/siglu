package com.siglu.repository;

import com.siglu.entity.HistorialCambio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialCambioRepository extends JpaRepository<HistorialCambio, Long> {
    
    Page<HistorialCambio> findByTablaAfectadaAndRegistroIdOrderByFechaCambioDesc(
        String tablaAfectada, Long registroId, Pageable pageable);
    
    @Query("SELECT h FROM HistorialCambio h WHERE h.tablaAfectada = :tabla AND h.registroId = :registroId")
    Page<HistorialCambio> findHistorialByTablaAndRegistroId(
        @Param("tabla") String tabla, 
        @Param("registroId") Long registroId, 
        Pageable pageable);
}
