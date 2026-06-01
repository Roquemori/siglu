package com.siglu.repository;

import com.siglu.entity.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {
    Optional<TipoDocumento> findByNombre(String nombre);
    List<TipoDocumento> findByOrderBySeccionAscOrdenAsc();
    List<TipoDocumento> findBySeccionOrderByOrdenAsc(String seccion);
}
