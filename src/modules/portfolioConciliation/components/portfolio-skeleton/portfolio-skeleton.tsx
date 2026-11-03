/** Primera carga de la pantalla: la forma de las tarjetas y la tabla mientras llegan los datos. */
const PortfolioSkeleton = () => (
  <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="Cargando cartera">
    <div className="h-3 w-72 rounded bg-[#ececec]" />
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-[74px] rounded-lg bg-[#f4f4f4]" />
      ))}
    </div>
    <div className="h-9 w-80 rounded-lg bg-[#f4f4f4]" />
    <div className="overflow-hidden rounded-lg border border-[#ececec]">
      <div className="h-9 bg-[#fafafa]" />
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex gap-4 border-t border-[#f0f0f0] px-3 py-3">
          <div className="h-3 w-10 rounded bg-[#ececec]" />
          <div className="h-3 w-32 rounded bg-[#ececec]" />
          <div className="h-3 w-20 rounded bg-[#ececec]" />
          <div className="ml-auto h-3 w-24 rounded bg-[#ececec]" />
          <div className="h-3 w-24 rounded bg-[#ececec]" />
          <div className="h-3 w-16 rounded bg-[#ececec]" />
        </div>
      ))}
    </div>
  </div>
);

export default PortfolioSkeleton;
