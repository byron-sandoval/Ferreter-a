import React, { useEffect, useState, useRef } from 'react';
import { Row } from 'reactstrap';
import ArticuloService from 'app/services/articulo.service';
import VentaService from 'app/services/venta.service';
import ClienteService from 'app/services/cliente.service';
import MonedaService from 'app/services/moneda.service';
import NumeracionService from 'app/services/numeracion.service';
import UsuarioService from 'app/services/usuario.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICliente, GeneroEnum } from 'app/shared/model/cliente.model';
import { IMoneda } from 'app/shared/model/moneda.model';
import { INumeracionFactura } from 'app/shared/model/numeracion-factura.model';
import { ICategoria } from 'app/shared/model/categoria.model';
import CategoriaService from 'app/services/categoria.service';
import { MetodoPagoEnum, IVenta } from 'app/shared/model/venta.model';
import { useAppSelector } from 'app/config/store';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

// Components
import { ProductCatalog } from './components/ProductCatalog';
import { VentaSidebar } from './components/VentaSidebar';
import { ClientRegistrationModal } from './components/ClientRegistrationModal';
import { SuccessModal } from './components/SuccessModal';
import { EmpresaService } from 'app/services/empresa.service';
import { IEmpresa } from 'app/shared/model/empresa.model';

export const NuevaVenta = () => {
  const account = useAppSelector(state => state.authentication.account);
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [termino, setTermino] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);

  // Datos del Cliente
  const [cliente, setCliente] = useState<ICliente | null>(null);
  const [busquedaCedula, setBusquedaCedula] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState<ICliente>({
    cedula: '',
    nombre: '',
    activo: true,
    genero: GeneroEnum.MASCULINO,
    direccion: '',
  });

  // Configuración Venta
  const [metodoPago, setMetodoPago] = useState<MetodoPagoEnum>(MetodoPagoEnum.EFECTIVO);
  const [esContado, setEsContado] = useState(true);
  const [monedas, setMonedas] = useState<IMoneda[]>([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<IMoneda | null>(null);
  const [numeracion, setNumeracion] = useState<INumeracionFactura | null>(null);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [montoPagado, setMontoPagado] = useState('');
  const [descuento, setDescuento] = useState<string>('0');
  const [voucher, setVoucher] = useState('');

  // Impresion
  const componentRef = useRef<any>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [ventaExitosa, setVentaExitosa] = useState<IVenta | null>(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [resArt, resMon, resNum, resEmp, resCat] = await Promise.all([
        ArticuloService.getAll(),
        MonedaService.getAll(),
        NumeracionService.getAll(),
        EmpresaService.getAll(),
        CategoriaService.getAll(),
      ]);
      setArticulos(resArt.data);
      setCategorias(resCat.data);
      setMonedas(resMon.data);
      if (resMon.data.length > 0) setMonedaSeleccionada(resMon.data[0]);
      if (resNum.data.length > 0) setNumeracion(resNum.data.find(n => n.activo) || resNum.data[0]);
      if (resEmp.data.length > 0) setEmpresa(resEmp.data[0]);

      // Cargar usuario por Keycloak ID
      if (account?.id) {
        const resUser = await UsuarioService.getByKeycloakId(account.id);
        if (resUser.data.length > 0) {
          setUsuarioActual(resUser.data[0]);
        } else {
          // Fallback: Si no existe en la tabla Usuario, usamos los datos de la cuenta
          setUsuarioActual({
            nombre: account.firstName && account.lastName ? `${account.firstName} ${account.lastName}` : account.login || 'Admin',
          });
        }
      }
    } catch (e) {
      toast.error('Error al cargar datos iniciales');
    }
  };

  const buscarCliente = async () => {
    if (!busquedaCedula) return;
    try {
      // 1. Intentar por Cédula (Exacta)
      let res = await ClienteService.getByCedula(busquedaCedula);

      // 2. Si no hay por cédula, intentar por Nombre (Contiene)
      if (res.data.length === 0) {
        res = await ClienteService.search(busquedaCedula);
      }

      if (res.data.length > 0) {
        const c = res.data[0];
        setCliente(c);

        if (res.data.length > 1) {
          toast.info(`Se encontraron ${res.data.length} coincidencias. Se seleccionó: ${c.nombre}.`);
        } else {
          if ((c.saldo || 0) > 0) {
            toast.warning(`Atención: El cliente ${c.nombre} tiene un saldo pendiente de C$ ${c.saldo?.toFixed(2)}`, { autoClose: 5000 });
          } else {
            toast.success(`Cliente seleccionado: ${c.nombre}`);
          }
        }
      } else {
        toast.info('No se encontró el cliente. Puede registrarlo ahora.');
        // Si parece una cédula (contiene guiones o muchos números), la pre-llenamos
        if (/[0-9]/.test(busquedaCedula)) {
          setNuevoCliente({ ...nuevoCliente, cedula: busquedaCedula, nombre: '' });
        } else {
          setNuevoCliente({ ...nuevoCliente, nombre: busquedaCedula, cedula: '' });
        }
        setShowClienteModal(true);
      }
    } catch (e) {
      toast.error('Error al buscar cliente');
    }
  };

  const guardarNuevoCliente = async () => {
    try {
      if (!nuevoCliente.cedula || !nuevoCliente.nombre) {
        toast.error('Cédula y Nombre son obligatorios');
        return;
      }

      // Validación de Cédula Nicaragüense (Formato: 001-010180-0005Y o 0010101800005Y)
      const cedulaLimpia = nuevoCliente.cedula.replace(/-/g, '').toUpperCase();
      const cedulaRegex = /^\d{13}[A-Z]$/;

      if (!cedulaRegex.test(cedulaLimpia)) {
        toast.error('La cédula no tiene un formato válido (Ej: 001-010180-0005Y)');
        return;
      }

      const clienteParaGuardar = {
        ...nuevoCliente,
        cedula: cedulaLimpia, // Guardamos la cédula limpia o formateada si prefieres
      };

      const res = await ClienteService.create(clienteParaGuardar);
      setCliente(res.data);
      setShowClienteModal(false);
      toast.success('Cliente registrado con éxito');
    } catch (e: any) {
      if (e.response?.status === 400) {
        toast.error('Error: Ya existe un cliente registrado con esta cédula.');
      } else {
        toast.error('cédula existente');
      }
    }
  };

  const agregarAlCarrito = (producto: IArticulo) => {
    const existente = carrito.find(item => item.articulo.id === producto.id);
    const cantActual = existente ? existente.cantidad : 0;

    if (cantActual + 1 > (producto.existencia || 0)) {
      toast.error(`No hay suficiente stock para ${producto.nombre}. Disponible: ${producto.existencia}`);
      return;
    }

    if (existente) {
      const actualizados = carrito.map(item =>
        item.articulo.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * (producto.precio || 0) }
          : item,
      );
      setCarrito(actualizados);
    } else {
      setCarrito([
        ...carrito,
        {
          articulo: producto,
          cantidad: 1,
          subtotal: producto.precio || 0,
        },
      ]);
    }
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter(item => item.articulo.id !== id));
  };

  const quitarUnoDelCarrito = (id: number) => {
    const existente = carrito.find(item => item.articulo.id === id);
    if (!existente) return;

    if (existente.cantidad > 1) {
      const actualizados = carrito.map(item =>
        item.articulo.id === id
          ? { ...item, cantidad: item.cantidad - 1, subtotal: (item.cantidad - 1) * (item.articulo.precio || 0) }
          : item,
      );
      setCarrito(actualizados);
    } else {
      eliminarDelCarrito(id);
    }
  };

  const subtotal = Math.round(carrito.reduce((acc, item) => acc + item.subtotal, 0) * 100) / 100;
  const descuentoNum = Math.round((parseFloat(descuento) || 0) * 100) / 100;
  const baseImponible = Math.round((subtotal - descuentoNum) * 100) / 100;
  const iva = Math.round((baseImponible > 0 ? baseImponible * 0.15 : 0) * 100) / 100;
  const total = Math.round((baseImponible + iva) * 100) / 100;

  // Calculo en moneda extranjera
  const conversionRate = monedaSeleccionada?.tipoCambio || 1;
  const totalEnMoneda = total / conversionRate;
  const montoPagadoNum = parseFloat(montoPagado) || 0;
  const cambio = montoPagadoNum - total;

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast.warning('El carrito está vacío');
      return;
    }
    if (!cliente) {
      toast.warning('Por favor seleccione un cliente');
      return;
    }

    if (!esContado && (cliente.saldo || 0) > 5000) {
      // Ejemplo de limite de credito
      toast.error('El cliente excede su límite de crédito. La venta debe ser de contado.');
      return;
    }

    if (metodoPago === MetodoPagoEnum.EFECTIVO && montoPagadoNum < total) {
      toast.error('El efectivo recibido es insuficiente para cubrir el total de la venta.');
      return;
    }

    if (metodoPago === MetodoPagoEnum.TARJETA_STRIPE && (!voucher || voucher.trim() === '')) {
      toast.error('Por favor ingrese el número de voucher o referencia de la tarjeta.');
      return;
    }

    try {
      setLoading(true);

      const ventaData: any = {
        fecha: dayjs().toISOString(),
        subtotal,
        iva,
        descuento: descuentoNum,
        total,
        totalEnMonedaBase: total, // Todo se asume en base C$ inicialmente
        metodoPago,
        stripeId: voucher.trim() ? voucher.trim() : null,
        importeRecibido: metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? total : montoPagadoNum,
        cambio: metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? 0 : (cambio > 0 ? cambio : 0),
        esContado,
        cliente,
        usuario: usuarioActual,
        moneda: monedaSeleccionada,
        numeracion,
        noFactura: (numeracion?.correlativoActual || 0) + 1,
      };

      const resVenta = await VentaService.createVenta(ventaData);
      const ventaId = resVenta.data.id;

      for (const item of carrito) {
        await VentaService.addDetalle({
          cantidad: item.cantidad,
          precioVenta: item.articulo.precio,
          monto: item.subtotal,
          articulo: item.articulo,
          venta: { id: ventaId },
        });

        // Actualizar stock del artículo
        const articuloActualizado = {
          ...item.articulo,
          existencia: (item.articulo.existencia || 0) - item.cantidad,
        };
        await ArticuloService.update(articuloActualizado);
      }

      // Actualizar saldo del cliente si es crédito
      if (!esContado && cliente) {
        const deuda = total - montoPagadoNum;
        if (deuda > 0) {
          const clienteActualizado = {
            ...cliente,
            saldo: (cliente.saldo || 0) + deuda,
          };
          await ClienteService.update(clienteActualizado);
        }
      }

      toast.success(`¡Venta #${resVenta.data.noFactura} registrada con éxito!`);

      // Si la respuesta no trae usuario (porque es un Admin sin record en DB),
      // le inyectamos manualmente el usuarioActual para que el modal lo muestre.
      const ventaFinal = {
        ...resVenta.data,
        usuario: resVenta.data.usuario || usuarioActual,
      };

      setVentaExitosa(ventaFinal);
      // Limpieza se hace despues de cerrar el modal de ticket o manual
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar la venta.');
    } finally {
      setLoading(false);
    }
  };

  const finalizarVentaYLimpiar = () => {
    setCarrito([]);
    setCliente(null);
    setBusquedaCedula('');
    setMontoPagado('');
    setVoucher('');
    setVentaExitosa(null);
    cargarDatosIniciales(); // Recargar stock y numeracion
  };

  return (
    <div className="pos-container animate__animated animate__fadeIn">
      <Row>
        <ProductCatalog
          articulos={articulos}
          categorias={categorias}
          termino={termino}
          setTermino={setTermino}
          categoriaFiltro={categoriaFiltro}
          setCategoriaFiltro={setCategoriaFiltro}
          agregarAlCarrito={agregarAlCarrito}
        />

        <VentaSidebar
          cliente={cliente}
          usuarioActual={usuarioActual}
          busquedaCedula={busquedaCedula}
          setBusquedaCedula={setBusquedaCedula}
          buscarCliente={buscarCliente}
          setShowClienteModal={setShowClienteModal}
          setCliente={setCliente}
          numeracion={numeracion}
          monedas={monedas}
          monedaSeleccionada={monedaSeleccionada}
          setMonedaSeleccionada={setMonedaSeleccionada}
          carrito={carrito}
          eliminarDelCarrito={eliminarDelCarrito}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          esContado={esContado}
          setEsContado={setEsContado}
          subtotal={subtotal}
          iva={iva}
          total={total}
          totalEnMoneda={totalEnMoneda}
          montoPagado={montoPagado}
          setMontoPagado={setMontoPagado}
          descuento={descuento}
          setDescuento={setDescuento}
          cambio={cambio}
          voucher={voucher}
          setVoucher={setVoucher}
          procesarVenta={procesarVenta}
          loading={loading}
          ventaExitosa={ventaExitosa}
          quitarUnoDelCarrito={quitarUnoDelCarrito}
          agregarAlCarrito={agregarAlCarrito}
          limpiarTodo={finalizarVentaYLimpiar}
        />
      </Row>

      <ClientRegistrationModal
        isOpen={showClienteModal}
        toggle={() => setShowClienteModal(!showClienteModal)}
        nuevoCliente={nuevoCliente}
        setNuevoCliente={setNuevoCliente}
        guardarNuevoCliente={guardarNuevoCliente}
      />

      <SuccessModal
        ventaExitosa={ventaExitosa}
        finalizarVentaYLimpiar={finalizarVentaYLimpiar}
        handlePrint={handlePrint}
        componentRef={componentRef}
        carrito={carrito}
        empresa={empresa}
      />
    </div>
  );
};

export default NuevaVenta;
