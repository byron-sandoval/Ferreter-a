import React, { useEffect, useState, useRef } from 'react';
import { Row } from 'reactstrap';
import ArticuloService from 'app/services/articulo.service';
import VentaService from 'app/services/venta.service';
import ClienteService from 'app/services/cliente.service';
import MonedaService from 'app/services/moneda.service';
import NumeracionService from 'app/services/numeracion.service';
import VendedorService from 'app/services/vendedor.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICliente, GeneroEnum } from 'app/shared/model/cliente.model';
import { IMoneda } from 'app/shared/model/moneda.model';
import { INumeracionFactura } from 'app/shared/model/numeracion-factura.model';
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

export const NuevaVenta = () => {
  const account = useAppSelector(state => state.authentication.account);
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [termino, setTermino] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
  const [vendedorActual, setVendedorActual] = useState<any>(null);
  const [montoPagado, setMontoPagado] = useState('');

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
      const [resArt, resMon, resNum] = await Promise.all([ArticuloService.getAll(), MonedaService.getAll(), NumeracionService.getAll()]);
      setArticulos(resArt.data);
      setMonedas(resMon.data);
      if (resMon.data.length > 0) setMonedaSeleccionada(resMon.data[0]);
      if (resNum.data.length > 0) setNumeracion(resNum.data.find(n => n.activo) || resNum.data[0]);

      // Cargar vendedor por Keycloak ID
      if (account?.id) {
        const resVend = await VendedorService.getByKeycloakId(account.id);
        if (resVend.data.length > 0) setVendedorActual(resVend.data[0]);
      }
    } catch (e) {
      toast.error('Error al cargar datos iniciales');
    }
  };

  const buscarCliente = async () => {
    if (!busquedaCedula) return;
    try {
      const res = await ClienteService.getByCedula(busquedaCedula);
      if (res.data.length > 0) {
        const c = res.data[0];
        setCliente(c);
        if ((c.saldo || 0) > 0) {
          toast.warning(`Atención: El cliente ${c.nombre} tiene un saldo pendiente de C$ ${c.saldo?.toFixed(2)}`, { autoClose: 5000 });
        } else {
          toast.success(`Cliente seleccionado: ${c.nombre}`);
        }
      } else {
        toast.info('Cliente no encontrado. Por favor regístrelo.');
        setNuevoCliente({ ...nuevoCliente, cedula: busquedaCedula });
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
      const res = await ClienteService.create(nuevoCliente);
      setCliente(res.data);
      setShowClienteModal(false);
      toast.success('Cliente registrado con éxito');
    } catch (e) {
      toast.error('Error al registrar cliente');
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

  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

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

    try {
      setLoading(true);

      const ventaData: IVenta = {
        fecha: dayjs(),
        subtotal,
        iva,
        total,
        totalEnMonedaBase: total, // Todo se asume en base C$ inicialmente
        metodoPago,
        importeRecibido: montoPagadoNum,
        cambio: cambio > 0 ? cambio : 0,
        esContado,
        cliente,
        vendedor: vendedorActual,
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
      }

      toast.success(`¡Venta #${resVenta.data.noFactura} registrada con éxito!`);
      setVentaExitosa(resVenta.data);
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
    setVentaExitosa(null);
    cargarDatosIniciales(); // Recargar stock y numeracion
  };

  return (
    <div className="pos-container animate__animated animate__fadeIn">
      <Row>
        <ProductCatalog articulos={articulos} termino={termino} setTermino={setTermino} agregarAlCarrito={agregarAlCarrito} />

        <VentaSidebar
          cliente={cliente}
          vendedorActual={vendedorActual}
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
          cambio={cambio}
          procesarVenta={procesarVenta}
          loading={loading}
          ventaExitosa={ventaExitosa}
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
      />
    </div>
  );
};

export default NuevaVenta;
