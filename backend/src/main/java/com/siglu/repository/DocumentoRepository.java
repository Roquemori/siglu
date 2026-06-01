package com.siglu.repository;

import com.siglu.entity.Documento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    Page<Documento> findByColaboradorIdAndActivoTrue(Long colaboradorId, Pageable pageable);
    List<Documento> findByColaboradorIdAndActivoTrue(Long colaboradorId);
    long countByColaboradorIdAndActivoTrue(Long colaboradorId);
}
