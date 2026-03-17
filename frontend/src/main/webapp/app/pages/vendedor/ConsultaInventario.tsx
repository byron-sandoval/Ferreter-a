import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Row, Col, Card, CardBody, Input, Badge, Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBox, faSync, faImages } from '@fortawesome/free-solid-svg-icons';
import ArticuloService from 'app/services/articulo.service';
import CategoriaService from 'app/services/categoria.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICategoria } from 'app/shared/model/categoria.model';

export const ConsultaInventario = () => {
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 1. Debounce: esperamos 400ms después de que deje de escribir para buscar en el backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 400); 
    return () => clearTimeout(timer);
  }, [filter]);

  // 2. Si cambian los filtros, volvemos a la página 0 y limpiamos la lista
  useEffect(() => {
    setPage(0);
    setArticulos([]);
    setHasMore(true);
  }, [debouncedFilter, catFilter]);

  // 3. Cargar las categorías (solo 1 vez al iniciar)
  useEffect(() => {
    const loadCat = async () => {
      try {
        const resCat = await CategoriaService.getAll();
        setCategorias(resCat.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadCat();
  }, []);

  // 4. Cada vez que cambia la `page` o los filtros (debounced), traemos datos
  useEffect(() => {
    loadData(page);
  }, [page, debouncedFilter, catFilter]);

  const loadData = async (currentPage: number) => {
    setLoading(true);
    try {
      const baseParams: any = { page: currentPage, size: 12, sort: 'nombre,asc' };
      baseParams['activo.equals'] = true;

      // Filtro de Categoría
      if (catFilter) {
        baseParams['categoriaId.equals'] = catFilter;
      }

      let data: IArticulo[] = [];
      let fetchCount = 0;

      // Filtro de Texto (búsqueda en ambos campos)
      if (debouncedFilter) {
        const paramsCodigo = { ...baseParams, 'codigo.contains': debouncedFilter };
        const paramsNombre = { ...baseParams, 'nombre.contains': debouncedFilter };

        const [resCodigo, resNombre] = await Promise.all([
          ArticuloService.getAll(paramsCodigo),
          ArticuloService.getAll(paramsNombre)
        ]);

        const combinados = [...(resCodigo.data || []), ...(resNombre.data || [])];
        const vistos = new Set<number>();
        data = combinados.filter(art => {
          if (vistos.has(art.id!)) return false;
          vistos.add(art.id!);
          return true;
        });

        fetchCount = Math.max((resCodigo.data || []).length, (resNombre.data || []).length);
      } else {
        const resArt = await ArticuloService.getAll(baseParams);
        data = resArt.data || [];
        fetchCount = data.length;
      }
      
      // Si es página 0 = reemplazamos. Si es > 0, agregamos.
      setArticulos(prev => (currentPage === 0 ? data : [...prev, ...data]));
      
      // Si llegaron 12 (el tamaño máximo por request para este componenete), asumimos que podría haber más en la sig pág
      setHasMore(fetchCount === 12);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 5. Scroll infinito: cuando el último elemento se ve en pantalla, suma 1 a 'page'
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      // Si cruza la pantalla y todavía hay más por cargar...
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Botón manual de actualizar
  const handleReload = () => {
    setPage(0);
    setArticulos([]);
    setHasMore(true);
    // Para que el effect de 'page' se dispare y haga fetch
    if (page === 0) loadData(0); 
  };

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold text-secondary mb-0">
          <FontAwesomeIcon icon={faBox} className="me-2 text-primary" /> Consulta Rápida
        </h5>
        <Button color="light" size="sm" onClick={handleReload} disabled={loading} style={{ fontSize: '0.75rem' }}>
          <FontAwesomeIcon icon={faSync} spin={loading} className="me-1" /> Actualizar
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-2 bg-light">
        <CardBody className="p-2">
          <Row className="g-2">
            <Col md="8">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  {loading && page === 0 ? (
                    <Spinner size="sm" color="primary" />
                  ) : (
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  )}
                </span>
                <Input
                  placeholder="Buscar por Nombre o Código de Barras..."
                  className="border-start-0"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </Col>
            <Col md="4">
              <Input
                type="select"
                bsSize="sm"
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="">Todas las Categorías</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Row className="g-2">
        {articulos.map((a, index) => {
          // Ponemos la ref en el último elemento (Card) del arreglo para que escuche el scroll
          const isLastElement = index === articulos.length - 1;

          return (
            <Col md="2" sm="4" xs="6" key={a.id}>
              <Card 
                innerRef={isLastElement ? lastElementRef : null} 
                className="h-100 border-0 shadow-sm hover-shadow transition-all"
              >
                <div className="text-center p-2 bg-white d-flex align-items-center justify-content-center" style={{ height: '110px' }}>
                  {a.imagenUrl ? (
                    <img
                      src={a.imagenUrl}
                      alt={a.nombre}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faImages} size="2x" className="text-muted opacity-25" />
                  )}
                </div>
                <CardBody className="border-top p-2">
                  <div className="d-flex justify-content-between align-items-start mb-1 gap-1">
                    <Badge color="info" className="p-1 opacity-75" style={{ fontSize: '0.65rem' }}>
                      {a.categoria?.nombre || 'General'}
                    </Badge>
                    <Badge
                      color={(a.existencia || 0) > (a.existenciaMinima || 0) ? 'success' : 'danger'}
                      pill
                      className="px-1"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {a.existencia} disp.
                    </Badge>
                  </div>
                  <div className="fw-bold text-dark mb-0 text-truncate" title={a.nombre} style={{ fontSize: '0.8rem' }}>
                    {a.nombre}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {a.codigo}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                      C$ {a.precio?.toFixed(2)}
                    </span>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                      mín: {a.existenciaMinima}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
        })}

        {/* Mensaje principal de "No hay resultados" (solo sí terminó de cargar y está vacío) */}
        {!loading && articulos.length === 0 && (
          <Col xs="12" className="text-center py-5">
            <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted opacity-25 mb-3" />
            <h5 className="text-muted">No encontramos productos con esos filtros.</h5>
          </Col>
        )}

        {/* Loader de scroll infinito cuando estamos pidiendo la sig página */}
        {loading && page > 0 && (
          <Col xs="12" className="text-center py-3">
            <Spinner color="primary" size="sm" className="me-2" />
            <small className="text-muted">Cargando más productos...</small>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ConsultaInventario;
