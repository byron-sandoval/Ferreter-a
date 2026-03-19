import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, Card, CardBody, Input, Badge, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICategoria } from 'app/shared/model/categoria.model';
import ArticuloService from 'app/services/articulo.service';

interface IProductCatalogProps {
  articulos: IArticulo[];
  categorias: ICategoria[];
  termino: string;
  setTermino: (val: string) => void;
  categoriaFiltro: string;
  setCategoriaFiltro: (val: string) => void;
  agregarAlCarrito: (prod: IArticulo) => void;
  refreshTrigger?: number;
}

export const ProductCatalog: React.FC<IProductCatalogProps> = ({
  articulos, // Se conserva por compatibilidad con el padre, pero usaremos paginación interna
  categorias,
  termino,
  setTermino,
  categoriaFiltro,
  setCategoriaFiltro,
  agregarAlCarrito,
  refreshTrigger = 0,
}) => {
  const [localArticulos, setLocalArticulos] = useState<IArticulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedTermino, setDebouncedTermino] = useState(termino);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 1. Debounce para el buscador
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermino(termino);
    }, 400);
    return () => clearTimeout(timer);
  }, [termino]);

  // 3. Cargar datos desde el backend usando paginación (useCallback para ser llamado desde efectos)
  const loadData = useCallback(async (p: number, isReset = false) => {
    setLoading(true);
    try {
      const pageSize = 12; // 12 para mostrar 3 filas de 4
      const baseParams: any = { page: p, size: pageSize, sort: 'nombre,asc' };
      baseParams['activo.equals'] = true;

      if (categoriaFiltro !== 'todas') {
        const cat = categorias.find(c => c.nombre === categoriaFiltro);
        if (cat) {
          baseParams['categoriaId.equals'] = cat.id;
        }
      }

      let data: IArticulo[] = [];
      let totalFetched = 0;

      if (debouncedTermino) {
        const paramsCodigo = { ...baseParams, 'codigo.contains': debouncedTermino };
        const paramsNombre = { ...baseParams, 'nombre.contains': debouncedTermino };

        const [resCodigo, resNombre] = await Promise.all([
          ArticuloService.getAll(paramsCodigo),
          ArticuloService.getAll(paramsNombre),
        ]);

        const combinados = [...(resCodigo.data || []), ...(resNombre.data || [])];
        const vistos = new Set<number>();
        data = combinados.filter(art => {
          if (vistos.has(art.id!)) return false;
          vistos.add(art.id!);
          return true;
        });

        totalFetched = Math.max((resCodigo.data || []).length, (resNombre.data || []).length);
      } else {
        const res = await ArticuloService.getAll(baseParams);
        data = res.data || [];
        totalFetched = data.length;
      }

      data = data.filter(p => (p.precio || 0) > 0);

      if (isReset) {
        setLocalArticulos(data);
      } else {
        setLocalArticulos(prev => [...prev, ...data]);
      }
      setHasMore(totalFetched === pageSize);
    } catch (e) {
      console.error("Error al cargar productos", e);
    } finally {
      setLoading(false);
    }
  }, [debouncedTermino, categoriaFiltro, categorias]);

  // 4. Reiniciar página cuando cambian los filtros o se pide refresh
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    if (categorias.length > 0) {
      loadData(0, true);
    }
  }, [debouncedTermino, categoriaFiltro, refreshTrigger, loadData, categorias.length]);

  // 5. Cargar siguiente página
  useEffect(() => {
    if (page > 0) {
      loadData(page, false);
    }
  }, [page, loadData]);

  // 4. Scroll infinito Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <Col md="7">
      <Card className="shadow-sm mb-2 border rounded-3 overflow-hidden">
        <CardBody className="py-2 px-3 bg-white">
          <Row className="align-items-center g-0">
            <Col className="d-flex align-items-center ps-2">
              <span className="text-muted me-2">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <Input
                placeholder="Escribe el nombre o código..."
                className="border-0 shadow-none ps-0 bg-transparent"
                style={{ fontSize: '0.9rem', fontWeight: '400' }}
                autoFocus
                value={termino}
                onChange={e => setTermino(e.target.value)}
              />
              {loading && page === 0 && <Spinner size="sm" color="primary" className="ms-2" />}
            </Col>
            <Col xs="auto" className="border-start ps-3">
              <Input
                type="select"
                className="border-0 shadow-none bg-transparent fw-bold text-primary"
                style={{ fontSize: '0.85rem', width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
              >
                <option value="todas">Todas las Categorías</option>
                {categorias
                  .filter(c => c.activo !== false)
                  .map(cat => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div style={{ height: 'calc(100vh - 180px)', overflowY: 'auto', overflowX: 'hidden', paddingRight: '10px' }}>
        <Row className="g-3">
          {localArticulos.length === 0 && !loading && (
            <Col md="12" className="text-center py-5 text-muted">
              <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3 opacity-50" />
              <h5>No se encontraron productos</h5>
              <p>Intenta buscar con otro nombre, código o categoría.</p>
            </Col>
          )}
          {localArticulos.map((prod, index) => {
            const isPendingReview = !!(prod.ultimoCosto && (prod.costo || 0) > (prod.ultimoCosto || 0));
            const isLastElement = index === localArticulos.length - 1;

            return (
              <Col md="3" key={prod.id}>
                <div ref={isLastElement ? lastElementRef : null} className="h-100">
                  <Card
                    className={`h-100 shadow-sm border-0 product-card overflow-hidden ${isPendingReview ? 'pending-product' : 'cursor-pointer'}`}
                    onClick={() => !isPendingReview && agregarAlCarrito(prod)}
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '12px',
                      backgroundColor: '#fff',
                      opacity: isPendingReview ? 0.7 : 1,
                      filter: isPendingReview ? 'grayscale(0.8)' : 'none',
                      cursor: isPendingReview ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!isPendingReview) {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isPendingReview) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                      }
                    }}
                  >
                    {/* Top Bar with Code and Stock */}
                    <div className="d-flex justify-content-between align-items-center px-2 pt-1">
                      <div className="text-muted fw-bold" style={{ fontSize: '0.55rem' }}>
                        #{prod.codigo}
                      </div>
                      <Badge
                        color={(prod.existencia || 0) > 0 ? 'success' : 'danger'}
                        className="px-2 py-1 shadow-sm"
                        style={{ fontSize: '0.70rem', borderRadius: '5px' }}
                      >
                        Stock: {prod.existencia}
                      </Badge>
                    </div>

                    {/* Image Container */}
                    <div
                      className="text-center d-flex align-items-center justify-content-center bg-white"
                      style={{ height: '100px', padding: '5px', position: 'relative' }}
                    >
                      {prod.imagenUrl ? (
                        <img
                          src={prod.imagenUrl}
                          alt={prod.nombre}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <FontAwesomeIcon icon={faBoxOpen} size="lg" className="text-muted opacity-50" />
                      )}

                      {isPendingReview && (
                        <div
                          className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{ backgroundColor: 'rgba(255,255,255,0.4)', top: 0, left: 0 }}
                        >
                          <Badge
                            color="secondary"
                            className="px-3 py-2 shadow fw-bold text-uppercase"
                            style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
                          >
                            PENDIENTE
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="px-2 pb-1 pt-0 text-start bg-white">
                      <div
                        className="fw-bold text-uppercase"
                        style={{
                          fontSize: '0.65rem',
                          letterSpacing: '0.4px',
                          color: '#444',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.2',
                          height: '2.4em',
                          wordBreak: 'break-word',
                        }}
                        title={prod.nombre}
                      >
                        {prod.nombre}
                      </div>
                      <div
                        className="fw-bold d-flex justify-content-between align-items-center"
                        style={{ color: '#007bff', fontSize: '0.90rem' }}
                      >
                        <span>C$ {prod.precio?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        {isPendingReview && (
                          <Badge color="warning" pill style={{ fontSize: '0.55rem' }}>
                            REVISIÓN PRECIO
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            );
          })}
          {loading && page > 0 && (
            <Col md="12" className="text-center py-3">
              <Spinner size="sm" color="primary" /> <span className="text-muted ms-2 small">Cargando más productos...</span>
            </Col>
          )}
        </Row>
      </div>
    </Col>
  );
};
