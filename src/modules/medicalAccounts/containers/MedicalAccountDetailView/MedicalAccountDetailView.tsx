"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { medicalAccountsMock } from "../../mocks/medicalAccountsMock";
import { MedicalAccountStatusTag } from "../../components/MedicalAccountStatusTag/MedicalAccountStatusTag";
import { MedicalAccountInfoPanel } from "../../components/MedicalAccountInfoPanel/MedicalAccountInfoPanel";
import { MedicalAccountNovedades } from "../../components/MedicalAccountNovedades/MedicalAccountNovedades";
import { MedicalAccountDocuments } from "../../components/MedicalAccountDocuments/MedicalAccountDocuments";

interface MedicalAccountDetailViewProps {
  accountId: string;
}

export function MedicalAccountDetailView({ accountId }: MedicalAccountDetailViewProps) {
  const router = useRouter();
  const account = medicalAccountsMock.find((item) => item.id === accountId);

  const handleGoBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/cuentas-medicas");
  };

  if (!account) {
    return (
      <main>
        <Card className="border-none">
          <CardContent>
            <Button
              onClick={handleGoBack}
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <p className="mt-4 text-gray-600">Cuenta médica no encontrada.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main>
      <Card className="border-none">
        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGoBack}
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
              <h1 className="text-lg font-bold text-cashport-black">{account.id}</h1>
            </div>
            <MedicalAccountStatusTag status={account.estado} />
          </div>

          <MedicalAccountInfoPanel account={account} />

          {account.novedades && account.novedades.length > 0 && (
            <MedicalAccountNovedades novedades={account.novedades} />
          )}

          <MedicalAccountDocuments documents={account.documents ?? []} />
        </CardContent>
      </Card>
    </main>
  );
}
