"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "antd";
import { ArrowLeft, Plus } from "lucide-react";

import Header from "@/components/organisms/header";
import { Card } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import {
  ICreateReferenceFormValues,
  IReferenceFile,
  IReferenceFilesFilters,
  IReferenceScopeLevel
} from "@/types/dataQuality/IDataQuality";
import {
  ICreateReferenceFileInput,
  createReferenceFile,
  replaceReferenceFile,
  setReferenceFileStatus
} from "@/services/dataQuality/references";

import {
  useReferenceContext,
  useReferenceFiles,
  useReferenceTypes
} from "../../hooks/useReferences";
import { useReferenceCatalogs } from "../../hooks/useReferenceCatalogs";
import { ReferencesTable } from "../../components/ReferencesTable";
import { ModalReferenceForm } from "../../components/ModalReferenceForm/ModalReferenceForm";
import { ModalReferenceDetail } from "../../components/ModalReferenceDetail/ModalReferenceDetail";
import { ModalReplaceReference } from "../../components/ModalReplaceReference/ModalReplaceReference";
import { ModalToggleReferenceStatus } from "../../components/ModalToggleReferenceStatus/ModalToggleReferenceStatus";
import {
  REFERENCE_SCOPE_OPTIONS,
  ReferenceContextQuery,
  resolveReferenceOwnerLabel,
  scopeLabel
} from "../../references/references.utils";

const CONTEXT_SCOPES: IReferenceScopeLevel[] = ["client", "country", "region"];

export default function ReferencesView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------------------------------------------------------------------------
  // Contexto del acceso: /data-quality/references?scope=country&id_country=1
  // ---------------------------------------------------------------------------
  const scopeParam = searchParams.get("scope");
  const contextScope: IReferenceScopeLevel | null =
    scopeParam && CONTEXT_SCOPES.includes(scopeParam as IReferenceScopeLevel)
      ? (scopeParam as IReferenceScopeLevel)
      : null;

  const rawOwner =
    contextScope === "client"
      ? searchParams.get("id_client")
      : contextScope === "country"
        ? searchParams.get("id_country")
        : contextScope === "region"
          ? searchParams.get("id_region")
          : null;
  const parsedOwner = rawOwner != null ? Number(rawOwner) : NaN;
  const isContextMode =
    contextScope !== null && Number.isFinite(parsedOwner) && parsedOwner > 0;
  const contextOwnerId = isContextMode ? parsedOwner : null;

  const [filters, setFilters] = useState<IReferenceFilesFilters>({});
  const [ownerFilter, setOwnerFilter] = useState<number | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailReference, setDetailReference] = useState<IReferenceFile | null>(null);
  const [replaceReference, setReplaceReference] = useState<IReferenceFile | null>(null);
  const [toggleReference, setToggleReference] = useState<IReferenceFile | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { referenceTypes } = useReferenceTypes();
  const { countries, regions, clients } = useReferenceCatalogs();

  const contextQuery: ReferenceContextQuery | null = isContextMode
    ? {
        scope_level: contextScope as IReferenceScopeLevel,
        ...(contextScope === "client" ? { id_client: contextOwnerId as number } : {}),
        ...(contextScope === "country" ? { id_country: contextOwnerId as number } : {}),
        ...(contextScope === "region" ? { id_region: contextOwnerId as number } : {}),
        ...(filters.reference_type ? { reference_type: filters.reference_type } : {})
      }
    : null;

  const {
    referenceContext,
    isLoading: contextLoading,
    isValidating: contextValidating,
    error: contextError,
    mutate: mutateContext
  } = useReferenceContext(contextQuery);

  const {
    referenceFiles,
    isLoading,
    isValidating,
    error,
    mutate
  } = useReferenceFiles(filters, !isContextMode);

  const catalogs = useMemo(
    () => ({
      countries: countries.map((c) => ({ id: c.id, country_name: c.country_name })),
      regions: regions.map((r) => ({ id: r.id, abbreviation: r.abbreviation })),
      clients: clients.map((c) => ({ id: c.id, client_name: c.client_name }))
    }),
    [countries, regions, clients]
  );

  const ownerLabel = (reference: IReferenceFile | null) =>
    reference ? resolveReferenceOwnerLabel(reference, catalogs) : "";

  const contextOwner = isContextMode
    ? {
        scope_level: contextScope as IReferenceScopeLevel,
        id_client: contextScope === "client" ? contextOwnerId : null,
        id_country: contextScope === "country" ? contextOwnerId : null,
        id_region: contextScope === "region" ? contextOwnerId : null
      }
    : null;
  const contextOwnerLabel = contextOwner
    ? resolveReferenceOwnerLabel(contextOwner, catalogs)
    : "";

  const ownReferences = referenceContext?.own ?? [];
  const inheritedReferences = referenceContext?.inherited ?? [];
  const references = referenceFiles ?? [];

  const displayError = isContextMode ? contextError : error;

  const handleCreate = async (values: ICreateReferenceFormValues) => {
    const input: ICreateReferenceFileInput = {
      referenceType: values.reference_type,
      scopeLevel: values.scope_level,
      ownerId: values.owner,
      description: values.description ?? null,
      sheetName: values.sheet_name ?? null,
      headerRow: values.header_row ?? null,
      file: values.file as File
    };
    await createReferenceFile(input);
    await mutate();
    await mutateContext();
  };

  const handleReplace = async (file: File) => {
    if (!replaceReference) return;
    setBusyId(replaceReference.id);
    try {
      await replaceReferenceFile(replaceReference.id, file);
      await mutate();
      await mutateContext();
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async () => {
    if (!toggleReference) return;
    setBusyId(toggleReference.id);
    try {
      await setReferenceFileStatus(toggleReference.id, toggleReference.is_active !== 1);
      await mutate();
      await mutateContext();
    } finally {
      setBusyId(null);
    }
  };

  const ownerFilterOptions = useMemo(() => {
    if (filters.scope_level === "client") {
      return clients.map((c) => ({ value: c.id, label: c.client_name }));
    }
    if (filters.scope_level === "country") {
      return countries.map((c) => ({ value: c.id, label: c.country_name }));
    }
    if (filters.scope_level === "region") {
      return regions.map((r) => ({ value: r.id, label: r.abbreviation }));
    }
    return [];
  }, [filters.scope_level, clients, countries, regions]);

  const handleScopeFilterChange = (value: IReferenceScopeLevel | undefined) => {
    setOwnerFilter(undefined);
    setFilters((prev) => {
      const next: IReferenceFilesFilters = { ...prev, scope_level: value };
      delete next.id_client;
      delete next.id_country;
      delete next.id_region;
      return next;
    });
  };

  const handleOwnerFilterChange = (value: number | undefined) => {
    setOwnerFilter(value);
    setFilters((prev) => {
      const next: IReferenceFilesFilters = { ...prev };
      delete next.id_client;
      delete next.id_country;
      delete next.id_region;
      if (value == null || !prev.scope_level) return next;
      if (prev.scope_level === "client") next.id_client = value;
      if (prev.scope_level === "country") next.id_country = value;
      if (prev.scope_level === "region") next.id_region = value;
      return next;
    });
  };

  const effectiveOwnIds = ownReferences
    .filter((reference) => reference.effective_for_type)
    .map((reference) => reference.id);
  const effectiveInheritedIds = inheritedReferences
    .filter((reference) => reference.effective_for_type)
    .map((reference) => reference.id);

  return (
    <div className="flex flex-col gap-4">
      <Header title="Data Quality" />
      <Card className="border-none gap-3 p-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900 w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>

        {isContextMode && (
          <div className="rounded-lg bg-[#F5F5F4] p-4">
            <p className="text-sm font-semibold text-[#141414]">
              Referencias — {scopeLabel(contextScope as IReferenceScopeLevel)}:{" "}
              {contextOwnerLabel}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Se muestran las referencias propias de este ámbito y las heredadas que
              aplican (precedencia cliente → país → región).
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              allowClear
              placeholder="Tipo"
              style={{ minWidth: 180 }}
              value={filters.reference_type}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, reference_type: value ?? undefined }))
              }
              options={(referenceTypes ?? []).map((t) => ({ value: t.code, label: t.description }))}
            />

            {!isContextMode && (
              <>
                <Select
                  allowClear
                  placeholder="Ámbito"
                  style={{ minWidth: 140 }}
                  value={filters.scope_level}
                  onChange={(value) =>
                    handleScopeFilterChange(value as IReferenceScopeLevel | undefined)
                  }
                  options={REFERENCE_SCOPE_OPTIONS}
                />
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Propietario"
                  style={{ minWidth: 180 }}
                  value={ownerFilter}
                  disabled={!filters.scope_level}
                  onChange={(value) => handleOwnerFilterChange(value as number | undefined)}
                  options={ownerFilterOptions}
                />
                <Select
                  allowClear
                  placeholder="Estado"
                  style={{ minWidth: 140 }}
                  value={filters.is_active}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, is_active: value as 0 | 1 | undefined }))
                  }
                  options={[
                    { value: 1, label: "Activo" },
                    { value: 0, label: "Inactivo" }
                  ]}
                />
              </>
            )}
          </div>

          <Button
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nueva referencia
          </Button>
        </div>

        {displayError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            No se pudieron cargar las referencias.{" "}
            {displayError instanceof Error ? displayError.message : ""}
          </div>
        )}

        {isContextMode ? (
          <div className="flex flex-col gap-6">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-[#141414]">
                Propias de {contextOwnerLabel}
              </h3>
              <ReferencesTable
                references={ownReferences}
                catalogs={catalogs}
                isLoading={contextLoading}
                isValidating={contextValidating}
                busyId={busyId}
                effectiveIds={effectiveOwnIds}
                onDetail={setDetailReference}
                onReplace={setReplaceReference}
                onToggle={setToggleReference}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-[#141414]">
                Heredadas que aplican a {contextOwnerLabel}
              </h3>
              <p className="text-xs text-[#6B7280]">
                Se marcan como «Efectiva» cuando son las que resuelven por precedencia para
                su tipo de referencia.
              </p>
              <ReferencesTable
                references={inheritedReferences}
                catalogs={catalogs}
                isLoading={contextLoading}
                isValidating={contextValidating}
                busyId={busyId}
                effectiveIds={effectiveInheritedIds}
                onDetail={setDetailReference}
                onReplace={setReplaceReference}
                onToggle={setToggleReference}
              />
            </section>
          </div>
        ) : (
          <ReferencesTable
            references={references}
            catalogs={catalogs}
            isLoading={isLoading}
            isValidating={isValidating}
            busyId={busyId}
            onDetail={setDetailReference}
            onReplace={setReplaceReference}
            onToggle={setToggleReference}
          />
        )}
      </Card>

      <ModalReferenceForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          mutate();
          mutateContext();
        }}
        referenceTypes={referenceTypes ?? []}
        countries={countries}
        regions={regions}
        clients={clients}
        lockedScopeLevel={isContextMode ? (contextScope as IReferenceScopeLevel) : undefined}
        lockedOwnerId={isContextMode ? (contextOwnerId as number) : undefined}
        onSubmit={handleCreate}
      />

      <ModalReferenceDetail
        isOpen={!!detailReference}
        onClose={() => setDetailReference(null)}
        reference={detailReference}
        ownerLabel={ownerLabel(detailReference)}
      />

      <ModalReplaceReference
        isOpen={!!replaceReference}
        onClose={() => setReplaceReference(null)}
        reference={replaceReference}
        ownerLabel={ownerLabel(replaceReference)}
        onSubmit={handleReplace}
      />

      <ModalToggleReferenceStatus
        isOpen={!!toggleReference}
        onClose={() => setToggleReference(null)}
        reference={toggleReference}
        ownerLabel={ownerLabel(toggleReference)}
        onConfirm={handleToggle}
      />
    </div>
  );
}
